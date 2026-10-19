"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/work";

// Infinite, draggable WebGL grid (ref: labs.griflan.com). Tiles repeat in every direction,
// drag/wheel have inertia, and the plane bulges with velocity.

const TILE_W = 512;
const TILE_H = 640;
const SEGMENTS = 12;

const VERT = `#version 300 es
in vec2 aUv;
in vec2 aCell;
uniform vec2 uRes, uOffset, uCell, uTile;
uniform float uCount, uBulge, uHover;
out vec2 vUv;
flat out float vIndex;
flat out float vHovered;
void main() {
  vec2 cell = floor(-uOffset / uCell) + aCell;
  float idx = mod(cell.x + cell.y * 3.0, uCount);
  idx = idx < 0.0 ? idx + uCount : idx;
  vIndex = idx;
  vHovered = step(abs(cell.x + cell.y * 10000.0 - uHover), 0.5);
  vec2 gap = uCell - uTile;
  vec2 p = cell * uCell + uOffset + gap * 0.5 + aUv * uTile; // px, top-left origin
  vec2 ndc = (p / uRes) * 2.0 - 1.0;
  ndc.y = -ndc.y;
  float d = dot(ndc, ndc);
  ndc *= 1.0 - uBulge * d;
  gl_Position = vec4(ndc, 0.0, 1.0);
  vUv = aUv;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
flat in float vIndex;
flat in float vHovered;
uniform sampler2D uAtlas;
uniform float uCount, uShift;
out vec4 outColor;
void main() {
  vec2 uv = vUv;
  float zoom = 1.0 - vHovered * 0.06;
  uv = (uv - 0.5) * zoom + 0.5;
  vec2 a = vec2((vIndex + uv.x) / uCount, uv.y);
  float s = uShift * 0.004;
  vec4 c = texture(uAtlas, a);
  c.r = texture(uAtlas, a + vec2(s / uCount, 0.0)).r;
  c.b = texture(uAtlas, a - vec2(s / uCount, 0.0)).b;
  outColor = c;
}`;

function drawAtlas(projects: Project[], images: (HTMLImageElement | null)[]) {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_W * projects.length;
  canvas.height = TILE_H;
  const ctx = canvas.getContext("2d")!;
  projects.forEach((p, i) => {
    const x = i * TILE_W;
    const img = images[i];
    if (img) {
      const scale = Math.max(TILE_W / img.width, TILE_H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, x + (TILE_W - w) / 2, (TILE_H - h) / 2, w, h);
      return;
    }
    // Placeholder card: monochrome, alternating ink / paper.
    const dark = i % 2 === 0;
    ctx.fillStyle = dark ? "#0a0a0a" : "#ffffff";
    ctx.fillRect(x, 0, TILE_W, TILE_H);
    ctx.strokeStyle = dark ? "rgba(250,250,247,0.14)" : "rgba(10,10,10,0.12)";
    for (let g = 64; g < TILE_W; g += 64) {
      ctx.beginPath();
      ctx.moveTo(x + g, 0);
      ctx.lineTo(x + g, TILE_H);
      ctx.stroke();
    }
    ctx.fillStyle = dark ? "#fafaf7" : "#0a0a0a";
    ctx.font = "500 22px ui-monospace, monospace";
    ctx.fillText(`[${String(i + 1).padStart(2, "0")}]`, x + 32, 56);
    ctx.fillText(p.year, x + TILE_W - 32 - ctx.measureText(p.year).width, 56);
    ctx.font = "600 64px system-ui, sans-serif";
    ctx.fillText(p.title, x + 32, TILE_H - 80);
    ctx.font = "400 22px ui-monospace, monospace";
    ctx.fillText(p.category.toUpperCase(), x + 32, TILE_H - 36);
  });
  return canvas;
}

function loadImage(src?: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function WorkGallery({ projects }: { projects: Project[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<Project | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) {
      setSupported(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const u = (n: string) => gl.getUniformLocation(prog, n);

    // Subdivided quad so the bulge curves edges.
    const uvs: number[] = [];
    for (let y = 0; y < SEGMENTS; y++)
      for (let x = 0; x < SEGMENTS; x++) {
        const [a, b, c, d] = [x / SEGMENTS, y / SEGMENTS, (x + 1) / SEGMENTS, (y + 1) / SEGMENTS];
        uvs.push(a, b, c, b, a, d, a, d, c, b, c, d);
      }
    const vertCount = uvs.length / 2;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(prog, "aUv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
    const cellBuf = gl.createBuffer();
    const aCell = gl.getAttribLocation(prog, "aCell");
    gl.enableVertexAttribArray(aCell);
    gl.vertexAttribDivisor(aCell, 1);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    Promise.all(projects.map((p) => loadImage(p.image))).then((imgs) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawAtlas(projects, imgs));
    });
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([250, 250, 247, 255]));

    let w = 0, h = 0, cols = 0, rows = 0;
    const cell = { w: 0, h: 0, tw: 0, th: 0 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      cell.tw = Math.max(180, Math.min(320, w * 0.22));
      cell.th = (cell.tw * TILE_H) / TILE_W;
      cell.w = cell.tw * 1.35;
      cell.h = cell.th * 1.25;
      cols = Math.ceil(w / cell.w) + 2;
      rows = Math.ceil(h / cell.h) + 2;
      const cells: number[] = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push(x, y);
      gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cells), gl.STATIC_DRAW);
      gl.vertexAttribPointer(aCell, 2, gl.FLOAT, false, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const offset = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let dragging = false, moved = 0, last = { x: 0, y: 0 }, pointer = { x: -1e4, y: -1e4 };
    let bulge = 0, hoverKey = -1e9;

    const cellAt = (px: number, py: number) => {
      const cx = Math.floor((px - offset.x) / cell.w);
      const cy = Math.floor((py - offset.y) / cell.h);
      const lx = px - offset.x - cx * cell.w - (cell.w - cell.tw) / 2;
      const ly = py - offset.y - cy * cell.h - (cell.h - cell.th) / 2;
      if (lx < 0 || ly < 0 || lx > cell.tw || ly > cell.th) return null;
      const n = projects.length;
      return { key: cx + cy * 10000, index: (((cx + cy * 3) % n) + n) % n };
    };

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      last = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      setCursor(pointer);
      if (!dragging) return;
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      target.x += dx * 1.2;
      target.y += dy * 1.2;
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      if (moved < 6) {
        const hit = cellAt(e.clientX, e.clientY);
        if (hit) window.location.hash = projects[hit.index].slug; // TODO: route to /work/[slug]
      }
    };
    const leave = () => {
      pointer = { x: -1e4, y: -1e4 };
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      target.x -= e.deltaX;
      target.y -= e.deltaY;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("wheel", wheel, { passive: false });

    let raf = 0, lastIndex = -1;
    const frame = () => {
      const ease = reduced ? 1 : 0.085;
      vel.x = (target.x - offset.x) * ease;
      vel.y = (target.y - offset.y) * ease;
      offset.x += vel.x;
      offset.y += vel.y;
      const speed = Math.min(Math.hypot(vel.x, vel.y) / 60, 1);
      bulge += ((reduced ? 0 : 0.06 + speed * 0.12) - bulge) * 0.1;

      const hit = dragging ? null : cellAt(pointer.x, pointer.y);
      hoverKey = hit ? hit.key : -1e9;
      const idx = hit ? hit.index : -1;
      if (idx !== lastIndex) {
        lastIndex = idx;
        setHovered(idx >= 0 ? projects[idx] : null);
        canvas.style.cursor = idx >= 0 ? "pointer" : "grab";
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u("uRes"), w, h);
      gl.uniform2f(u("uOffset"), offset.x, offset.y);
      gl.uniform2f(u("uCell"), cell.w, cell.h);
      gl.uniform2f(u("uTile"), cell.tw, cell.th);
      gl.uniform1f(u("uCount"), projects.length);
      gl.uniform1f(u("uBulge"), bulge);
      gl.uniform1f(u("uHover"), hoverKey);
      gl.uniform1f(u("uShift"), reduced ? 0 : speed * 4);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, vertCount, cols * rows);
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("wheel", wheel);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [projects]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-(--bg) select-none">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: "grab" }}
      />

      {hovered && (
        <div
          className="text-label pointer-events-none fixed z-10 rounded-full bg-(--fg) px-(--space-3) py-(--space-1) text-(--invert-fg)"
          style={{ left: cursor.x + 16, top: cursor.y + 16 }}
        >
          View — {hovered.title}
        </div>
      )}

      <div className="text-label pointer-events-none absolute inset-x-0 bottom-0 flex justify-between p-(--gutter)">
        <span>(01) Selected Work</span>
        <span className="text-muted">Drag to explore</span>
      </div>

      {/* Accessible fallback: always present for keyboard / screen readers, visible without WebGL. */}
      <nav aria-label="Projects" className={supported ? "sr-only" : "absolute inset-0 overflow-auto p-(--gutter)"}>
        <ul>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <a href={`#${p.slug}`} className="block py-(--space-2) hover:text-muted">
                [{String(i + 1).padStart(2, "0")}] {p.title} — {p.category}, {p.year}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
