# Portfolio — Build Plan

> Rencana kerja dan status build. Acuan desain ada di [DESIGN-DIRECTION.md](DESIGN-DIRECTION.md).
> Update file ini setiap ada fase selesai, keputusan baru, atau perubahan rencana.

**Status legend:** ✅ selesai · 🔍 sedang direview · 🚧 dikerjakan · ⏳ belum mulai

---

## Cara kerja

1. Setiap fase dikerjakan, lalu **direview satu per satu** sebelum lanjut ke fase berikutnya.
2. Keputusan yang diambil saat review dicatat di **Decision log** (bagian bawah).
3. Pertanyaan yang belum dijawab dicatat di **Open questions**.
4. Kalau implementasi beda dari DESIGN-DIRECTION.md, catat di sini dan update dokumen desainnya.

---

## Ringkasan fase

| # | Fase | Status |
|---|---|---|
| 0 | Setup project | ✅ |
| D | **Desain + design system di pen.dev (oleh Endah)** | 🚧 |
| 1 | Foundation: token, font, grid, button (disesuaikan dengan design system pen.dev) | ⏸ menunggu fase D |
| 2 | Layout: header/nav, section marker, page transition, smooth scroll | ⏳ |
| 3 | Konten statis semua halaman + deploy pertama | ⏳ |
| 4 | Work: gallery imersif + template case study | ⏳ |
| 5 | Playground: kanvas + kartu draggable | ⏳ |
| 6 | Mascot: Rive state machine | ⏳ |
| 7 | Polish: performa, a11y, mobile, reduced-motion, OG image | ⏳ |
| 8 | User test, iterasi, launch | ⏳ |

---

## Fase 0 — Setup project ✅

- [x] Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + ESLint
- [x] Alias import `@/*`
- [x] Init git
- [ ] Push ke repo GitHub
- [x] File deployment: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `deploy/`
- [ ] Setup server sekali jalan: `bash deploy/setup-server.sh` (systemd, Caddy, self-hosted runner)

**Alur deploy (VPS, bukan Vercel):**
- Push ke branch lain / PR → **CI** (lint + build) di runner GitHub.
- Push ke `main` → **Deploy** di runner self-hosted di VPS: build → release baru di `/var/www/portfolio/releases/<sha>` → symlink `current` → restart service `portfolio` → health check → rollback otomatis kalau gagal. Simpan 5 release terakhir.
- Next.js jalan sebagai `output: "standalone"` di `127.0.0.1:3000`, Caddy reverse proxy di port 80 (HTTPS otomatis setelah domain diarahkan).

---

## Fase D — Desain di pen.dev 🚧

Endah mendesain halaman dan design system di pen.dev. Setelah selesai, Claude membaca file `.pen` lewat Pencil MCP
lalu menyesuaikan kode di Fase 1 (token, grid, button) agar sama persis dengan desain.

- [ ] Design system: warna, tipografi, spacing, grid, komponen (button, label, card, dll.)
- [ ] Desain halaman: Home, Work, Case study, Playground, About, Contact, 404
- [ ] Simpan file `.pen` di folder project (atau kasih path-nya)

---

## Fase 1 — Foundation ⏸

> Kode token, grid, dan button yang sudah ada adalah **draft awal** dari DESIGN-DIRECTION.md.
> Akan disesuaikan dengan design system pen.dev setelah Fase D selesai.

**Tujuan:** semua fondasi visual siap dipakai komponen lain.

| Item | File | Status |
|---|---|---|
| Design tokens (warna, type, spacing, layout, motion) | `styles/tokens.css` | 🔍 direview |
| Token → Tailwind utilities + kelas tipografi | `app/globals.css` | ⏳ review |
| Motion tokens untuk JS (ease, durasi, spring) | `lib/motion.ts` | ⏳ review |
| Font Geist Sans + Geist Mono | `app/layout.tsx` | ✅ |
| Font Geist Pixel | — | ⏳ dimuat saat pertama dibutuhkan |
| Grid editorial (`Grid`, `Col`, `SectionLabel`) | `components/layout/Grid.tsx` | ⏳ review |
| Button tactile (solid / outline, md / lg, link / button) | `components/ui/Button.tsx` | ⏳ review |
| Halaman preview foundation | `app/page.tsx` | ⏳ review (sementara, diganti Home asli di fase 3) |

**Belum dilakukan:**
- [ ] `npm run build` + lint check
- [ ] Cek visual di browser (desktop + mobile)

**Definition of done:** token disetujui, grid dan button disetujui secara visual, build lolos.

---

## Fase 2 — Layout ⏳

- [ ] Install: `gsap`, `motion`, `lenis`
- [ ] Header + nav (Home · Work · Playground · About · Contact), versi mobile
- [ ] Footer
- [ ] Section marker / progress kiri (ref: brettmcm.com)
- [ ] Smooth scroll Lenis (mati saat reduced-motion)
- [ ] Page transition antar halaman
- [ ] Custom cursor (opsional, mati di touch)

---

## Fase 3 — Konten statis + deploy ⏳

- [ ] Setup MDX (`content/work/*.mdx`, `content/playground/*.mdx`)
- [ ] Pindahkan 3–4 case study dari endahdesign.framer.ai
- [ ] Halaman: Home, Work, Case study, Playground, About, Contact, 404 (tanpa animasi besar)
- [ ] Metadata dasar per halaman
- [ ] Deploy pertama ke VPS

---

## Fase 4 — Work ⏳

- [ ] Work gallery imersif (ref: labs.griflan.com)
- [ ] Shared-element transition gallery → case study
- [ ] Template case study + section marker + progress membaca

---

## Fase 5 — Playground ⏳

- [ ] Kanvas grid
- [ ] Kartu "window" draggable dengan inertia, klik untuk naik ke atas (ref: paper.design/mono)
- [ ] Detail kartu (modal/window membesar)
- [ ] Filter tag + tombol "Tidy up"
- [ ] Kontrol keyboard untuk kartu
- [ ] Versi mobile (list/masonry)

---

## Fase 6 — Mascot ⏳

**Butuh dari Endah dulu:** mascot vektor + kacamata, dipisah per layer.

- [ ] Animasi di Rive + State Machine (input: `pointerX`, `pointerY`, `isHover`, `click`, `page`, `idleTime`)
- [ ] Komponen `Mascot` (Rive + fallback SVG statis)
- [ ] Pasang di Home dulu, lalu halaman lain sesuai tabel pose di DESIGN-DIRECTION.md §5

---

## Fase 7 — Polish ⏳

- [ ] Lighthouse mobile 90+, LCP < 2.5s
- [ ] Audit a11y (keyboard, kontras, alt text, focus ring)
- [ ] Cek reduced-motion di semua halaman
- [ ] Cek mobile (tanpa hover)
- [ ] OG image per halaman & per case study
- [ ] Analytics (Plausible / Umami self-hosted)

---

## Fase 8 — Test & launch ⏳

- [ ] Test ke 3–5 orang (termasuk non-designer)
- [ ] Iterasi dari feedback
- [ ] Hubungkan domain
- [ ] Launch

---

## Aset dari Endah

- [ ] Mascot vektor + kacamata, per layer
- [ ] Pose mascot per halaman
- [ ] Pilihan 3–4 case study
- [ ] Mockup resolusi tinggi
- [ ] Aset playground + tag
- [ ] Positioning satu kalimat
- [ ] Bio, foto, CV PDF, link sosial
- [ ] Nama domain

---

## Open questions

| # | Pertanyaan | Fase |
|---|---|---|
| 1 | `--muted`: `#6B6B6B` (sesuai dokumen, lolos AA) atau `#5F5F5F` (sekarang di kode)? | 1 |
| 2 | Breakpoint 768 / 1200 oke, atau ikut grid di Figma? | 1 |
| 3 | `--dur-slow` 700ms oke? | 1 |

---

## Decision log

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 2026-10-19 | Konsep "Sketchbook seorang designer", monokrom + mascot | Target studio kreatif, butuh craft + personality |
| 2026-10-19 | Font: Geist, Geist Mono, Geist Pixel | Satu keluarga, free commercial use |
| 2026-10-19 | Framework: Next.js (bukan Vite/Vue) | SEO + OG per case study, page transition, ekosistem animasi React |
| 2026-10-19 | Animasi: GSAP + Motion + Lenis, mascot pakai Rive | Scroll presisi, gesture/drag, mascot interaktif |
| 2026-10-19 | Menu: Home, Work, Playground, About, Contact | Request Endah |
| 2026-10-19 | Bahasa situs: English | Target studio internasional |
| 2026-10-19 | Grid kolom ikut token `--grid-cols` (1 / 2 / 3) | Komponen nggak perlu class responsif masing-masing |
| 2026-10-19 | Spring di `lib/motion.ts`, bukan CSS | Spring hanya dipakai lewat JS |
| 2026-10-19 | Deploy ke VPS sendiri (Caddy + systemd + GitHub Actions self-hosted runner), bukan Vercel | Server sudah ada, kontrol penuh |
| 2026-10-19 | Desain + design system dibuat dulu di pen.dev, kode menyusul | Design-first, kode jadi implementasi dari desain |
