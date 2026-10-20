"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/work";

// Infinite WebGL gallery on a tilted floor plane (ref: labs.griflan.com).
// Tiles live on a plane in "plane px" (origin = screen center, +y = toward viewer), which is
// tilted around the X axis and projected with a real perspective divide. Drag / wheel pan the
// plane with inertia; speed briefly steepens the tilt.

const TILE_W = 768;
const TILE_H = 480;
const SEGMENTS = 8;

const VERT = `#version 300 es
in vec2 aUv;
in vec2 aCell;
uniform vec2 uRes, uOffset, uCell, uTile, uStart, uGridMin, uGridMax;
uniform float uCount, uTilt, uDist, uHover, uMode;
out vec2 vUv;
out vec2 vPlane;
out float vDepth;
flat out float vIndex;
flat out float vHovered;
void main() {
  vec2 q;
  if (uMode > 0.5) {
    q = mix(uGridMin, uGridMax, aUv);
    vIndex = 0.0;
    vHovered = 0.0;
  } else {
    vec2 cell = uStart + aCell;
    float idx = mod(cell.x + cell.y * 3.0, uCount);
    vIndex = idx < 0.0 ? idx + uCount : idx;
    vHovered = step(abs(cell.x + cell.y * 1000.0 - uHover), 0.5);
    vec2 gap = uCell - uTile;
    float grow = 1.0 + vHovered * 0.04;
    vec2 center = cell * uCell + uOffset + uCell * 0.5;
    q = center + (aUv - 0.5) * uTile * grow;
  }
  float c = cos(uTilt), s = sin(uTilt);
  float depth = uDist - q.y * s;
  vec2 v = vec2(q.x, q.y * c) * uDist;
  gl_Position = vec4(v.x / (uRes.x * 0.5), -v.y / (uRes.y * 0.5), 0.0, depth);
  vUv = aUv;
  vPlane = q;
  vDepth = depth / uDist;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vPlane;
in float vDepth;
flat in float vIndex;
flat in float vHovered;
uniform sampler2D uAtlas;
uniform float uCount, uMode;
uniform vec2 uOffset, uCell;
out vec4 outColor;
void main() {
  float fog = 1.0 - smoothstep(1.4, 3.2, vDepth);
  if (uMode > 0.5) {
    vec2 g = (vPlane - uOffset) / (uCell * 0.5);
    vec2 d = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(d.x, d.y), 1.0);
    outColor = vec4(vec3(0.98), line * 0.07 * fog);
    return;
  }
  vec2 a = vec2((vIndex + vUv.x) / uCount, vUv.y);
  vec3 col = texture(uAtlas, a).rgb;
  col *= 0.86 + vHovered * 0.14;
  outColor = vec4(col * fog, 1.0);
}`;

// Placeholder collage: a few panels per project, like a mini case-study board.
function drawAtlas(projects: Project[], images: (HTMLImageElement | null)[]) {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_W * projects.length;
  canvas.height = TILE_H;
  const ctx = canvas.getContext("2d")!;
  const palettes = [
    ["#0a0a0a", "#fafaf7", "#2b2b2b", "#d9d9d4"],
    ["#fafaf7", "#0a0a0a", "#bdbdb8", "#3a3a3a"],
  ];
  projects.forEach((p, i) => {
    const x0 = i * TILE_W;
    const img = images[i];
    if (img) {
      const scale = Math.max(TILE_W / img.width, TILE_H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, x0 + (TILE_W - w) / 2, (TILE_H - h) / 2, w, h);
      return;
    }
    const pal = palettes[i % 2];
    const pad = 6;
    const panels = [
      [0, 0, 0.42, 0.5],
      [0.42, 0, 0.3, 0.5],
      [0.72, 0, 0.28, 0.5],
      [0, 0.5, 0.3, 0.5],
      [0.3, 0.5, 0.7, 0.5],
    ];
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(x0, 0, TILE_W, TILE_H);
    panels.forEach(([px, py, pw, ph], k) => {
      const bg = pal[(k + i) % 4];
      const fg = bg === "#0a0a0a" || bg === "#2b2b2b" || bg === "#3a3a3a" ? "#fafaf7" : "#0a0a0a";
      const rx = x0 + px * TILE_W + pad / 2;
      const ry = py * TILE_H + pad / 2;
      const rw = pw * TILE_W - pad;
      const rh = ph * TILE_H - pad;
      ctx.fillStyle = bg;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.fillStyle = fg;
      if (k === 0) {
        ctx.font = "600 52px system-ui, sans-serif";
        ctx.fillText(p.title, rx + 20, ry + rh - 24, rw - 40);
        ctx.font = "500 16px ui-monospace, monospace";
        ctx.fillText(`[${String(i + 1).padStart(2, "0")}]  ${p.year}`, rx + 20, ry + 34);
      } else if (k === 4) {
        ctx.font = "500 16px ui-monospace, monospace";
        ctx.fillText(p.category.toUpperCase(), rx + 20, ry + 34);
        ctx.globalAlpha = 0.5;
        for (let b = 0; b < 5; b++) ctx.fillRect(rx + 20, ry + 64 + b * 22, rw * (0.3 + ((b * 37 + i * 13) % 50) / 100), 8);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + rh / 2, Math.min(rw, rh) * (0.18 + ((k + i) % 3) * 0.08), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uvs: number[] = [];
    for (let y = 0; y < SEGMENTS; y++)
      for (let x = 0; x < SEGMENTS; x++) {
        const [a, b, c, d] = [x / SEGMENTS, y / SEGMENTS, (x + 1) / SEGMENTS, (y + 1) / SEGMENTS];
        uvs.push(a, b, c, b, a, d, a, d, c, b, c, d);
      }
    const vertCount = uvs.length / 2;
    gl.bindVertexArray(gl.createVertexArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 20, 255]));
    gl.generateMipmap(gl.TEXTURE_2D);
    Promise.all(projects.map((p) => loadImage(p.image))).then((imgs) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawAtlas(projects, imgs));
      gl.generateMipmap(gl.TEXTURE_2D);
    });

    let w = 0, h = 0, dist = 0;
    const cell = { w: 0, h: 0, tw: 0, th: 0 };
    const baseTilt = 0.82;
    let tilt = baseTilt;
    let maxInstances = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      dist = h * 1.1;
      cell.tw = Math.max(220, Math.min(380, w * 0.26));
      cell.th = (cell.tw * TILE_H) / TILE_W;
      cell.w = cell.tw * 1.6;
      cell.h = cell.th * 2.1;
      // Generous instance pool; the visible window is recomputed every frame.
      const cols = 24, rows = 24;
      maxInstances = cols * rows;
      const cells: number[] = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push(x, y);
      gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cells), gl.STATIC_DRAW);
      gl.vertexAttribPointer(aCell, 2, gl.FLOAT, false, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Screen px (from center, +y down) -> plane px, and back.
    const toPlane = (sx: number, sy: number) => {
      const c = Math.cos(tilt), s = Math.sin(tilt);
      const y = (sy * dist) / (c * dist + sy * s);
      return { x: (sx * (dist - y * s)) / dist, y };
    };

    const offset = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let dragging = false, moved = 0, last = { x: 0, y: 0 }, pointer = { x: -1e4, y: -1e4 };

    const cellAt = (px: number, py: number) => {
      if (px < 0 || py < 0 || px > w || py > h) return null;
      const q = toPlane(px - w / 2, py - h / 2);
      const cx = Math.floor((q.x - offset.x) / cell.w);
      const cy = Math.floor((q.y - offset.y) / cell.h);
      const lx = q.x - offset.x - cx * cell.w - (cell.w - cell.tw) / 2;
      const ly = q.y - offset.y - cy * cell.h - (cell.h - cell.th) / 2;
      if (lx < 0 || ly < 0 || lx > cell.tw || ly > cell.th) return null;
      const n = projects.length;
      return { key: cx + cy * 1000, index: (((cx + cy * 3) % n) + n) % n };
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
      target.x += dx * 1.3;
      target.y += dy * 2;
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
      target.y -= e.deltaY * 1.4;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("wheel", wheel, { passive: false });

    let raf = 0, lastIndex = -1;
    const frame = () => {
      const ease = reduced ? 1 : 0.08;
      const vx = (target.x - offset.x) * ease;
      const vy = (target.y - offset.y) * ease;
      offset.x += vx;
      offset.y += vy;
      if (!reduced) {
        const speed = Math.max(-1, Math.min(1, vy / 40));
        tilt += (baseTilt + speed * 0.12 - tilt) * 0.08;
      }

      // Visible plane window: top edge reaches far back, bottom is near the viewer.
      const top = toPlane(0, -h / 2).y;
      const bottom = toPlane(0, h / 2).y;
      const halfW = ((w / 2) * (dist - top * Math.sin(tilt))) / dist;
      const minX = -halfW - cell.w, maxX = halfW + cell.w;
      const minY = top - cell.h, maxY = bottom + cell.h;
      const start = [Math.floor((minX - offset.x) / cell.w), Math.floor((minY - offset.y) / cell.h)];
      const count = Math.min(maxInstances, 24 * Math.min(24, Math.ceil((maxY - minY) / cell.h) + 1));

      const hit = dragging ? null : cellAt(pointer.x, pointer.y);
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
      gl.uniform2f(u("uStart"), start[0], start[1]);
      gl.uniform2f(u("uGridMin"), minX, minY);
      gl.uniform2f(u("uGridMax"), maxX, maxY);
      gl.uniform1f(u("uCount"), projects.length);
      gl.uniform1f(u("uTilt"), tilt);
      gl.uniform1f(u("uDist"), dist);
      gl.uniform1f(u("uHover"), hit ? hit.key : -1e9);

      gl.uniform1f(u("uMode"), 1);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, vertCount, 1);
      gl.uniform1f(u("uMode"), 0);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, vertCount, count);
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
    <div className="relative h-dvh w-full overflow-hidden bg-(--invert-bg) text-(--invert-fg) select-none">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: "grab" }}
      />

      <header className="text-label pointer-events-none absolute inset-x-0 top-0 grid grid-cols-3 items-center border-b border-white/10 bg-(--invert-bg)/80 p-(--gutter) backdrop-blur">
        <span>ENDAH LIYUSLIHA</span>
        <span className="text-center">(01) Selected Work</span>
        <span className="text-right opacity-60">{projects.length} projects</span>
      </header>

      {hovered && (
        <div
          className="text-label pointer-events-none fixed z-10 rounded-full bg-(--invert-fg) px-(--space-3) py-(--space-1) text-(--invert-bg)"
          style={{ left: cursor.x + 16, top: cursor.y + 16 }}
        >
          View — {hovered.title}
        </div>
      )}

      <div className="text-label pointer-events-none absolute inset-x-0 bottom-(--gutter) flex justify-center">
        <span className="rounded-full border border-white/20 bg-(--invert-bg)/70 px-(--space-4) py-(--space-2) backdrop-blur">
          Drag or scroll to explore
        </span>
      </div>

      {/* Accessible fallback: always present for keyboard / screen readers, visible without WebGL. */}
      <nav aria-label="Projects" className={supported ? "sr-only" : "absolute inset-0 overflow-auto p-(--gutter) pt-24"}>
        <ul>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <a href={`#${p.slug}`} className="block py-(--space-2) hover:opacity-60">
                [{String(i + 1).padStart(2, "0")}] {p.title} — {p.category}, {p.year}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
