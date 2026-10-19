# Portfolio — Design Direction

> Dokumen acuan untuk portfolio UI/UX + design exploration milik Endah Liyusliha.
> Semua keputusan desain dan teknis merujuk ke sini. Update dokumen ini kalau ada keputusan baru.

---

## 1. Tujuan

- **Target:** diterima kerja di **studio kreatif**.
- **Fokus:** creativity, exploration, animation, interactivity.
- **Yang harus ditangkap visitor dalam 30–60 detik:**
  1. Lo bisa bikin UX yang terstruktur (case study).
  2. Lo punya craft di motion dan interaksi (situsnya sendiri adalah buktinya).
  3. Lo punya personality (mascot).
- **Prinsip utama:** efek nggak boleh menghalangi konten. Work selalu bisa diakses dalam 1 klik.

---

## 2. Konsep besar

### "Sketchbook seorang designer"

Editorial monokrom yang rapi, dihidupkan oleh mascot yang lucu, malas, dan relatable.

> **Rapi di struktur, nakal di interaksi.**
> **Layout tenang, mascot yang berisik.**

Layout, grid, dan tipografi sengaja kalem dan sistematis. Semua humor dan kejutan datang dari mascot dan micro-interaction. Kontras inilah yang bikin situs ini diingat.

---

## 3. Personality

| Sifat | Artinya di situs |
|---|---|
| **Playful** | Mascot bereaksi ke kursor, klik, dan halaman. Ada easter egg kecil. |
| **Crafted** | Grid presisi, hairline 1px, spacing konsisten, label editorial. |
| **Curious** | Playground terasa seperti meja kerja: bisa diacak, di-drag, dieksplor. |
| **Honest & relaxed** | Copy santai, nggak korporat. Mascot rebahan dan males-malesan, tapi kerjanya serius. |
| **Tactile** | Button terasa ditekan, kartu punya bobot waktu dilempar. |

**Tone of voice:** santai, singkat, sedikit jenaka, tetap profesional di case study. Bahasa situs: **English** (target studio internasional).

---

## 4. Visual system

### 4.1 Warna

Monokrom. Hampir satu warna. "Warna" datang dari gerak, bentuk, dan kontras.

| Token | Nilai | Pemakaian |
|---|---|---|
| `--bg` | `#FAFAF7` (off-white) | Background utama |
| `--fg` | `#0A0A0A` | Teks, garis, elemen, mascot outline |
| `--muted` | `#6B6B6B` | Label sekunder, metadata |
| `--line` | `#0A0A0A` @ 12% | Hairline grid & divider |
| `--surface` | `#FFFFFF` | Kartu playground, panel |
| `--invert-bg` / `--invert-fg` | `#0A0A0A` / `#FAFAF7` | Section kontras, hover state, cursor |

- Gambar mockup case study boleh berwarna. Itu satu-satunya sumber warna, jadi biarkan karya yang "bersuara".
- Dark mode: **tidak di fase awal.** Brand-nya putih-hitam. Bisa jadi easter egg nanti (misal mascot "matiin lampu").

### 4.2 Tipografi — Geist family (free, commercial use OK)

| Font | Peran |
|---|---|
| **Geist Sans** | Heading, body, UI. Variable font, jadi weight bisa dianimasikan. |
| **Geist Mono** | Label editorial (`(01) Selected Work`, `[05]`), metadata, title bar kartu playground, angka. |
| **Geist Pixel** | Cadangan untuk aksen khusus: easter egg, loading, 404, label playground. Hemat, jangan jadi gaya utama. |

**Skala (awal, bisa disesuaikan):**

| Token | Ukuran | Pemakaian |
|---|---|---|
| `display` | clamp(56px, 9vw, 144px), tracking -0.04em | Nama / hero |
| `h1` | clamp(40px, 5vw, 72px) | Judul halaman |
| `h2` | clamp(28px, 3vw, 40px) | Judul section |
| `body-l` | 20px / 1.5 | Intro |
| `body` | 16px / 1.6 | Teks umum |
| `label` | 12px mono, uppercase opsional | Label & metadata |

Load via paket `geist` (npm) atau `next/font`.

### 4.3 Grid & layout — ref: helloprokhorov.com

- Grid editorial **3 kolom** di desktop (kiri: info/sosial/nav, tengah: konten, kanan: meta/kontak). Di tablet 2 kolom, di mobile 1 kolom.
- Hairline 1px kelihatan sebagai elemen desain, bukan cuma pembatas.
- Penomoran editorial: `(01)`, `[05]`, `01 — 05`.
- Spacing pakai skala 4px: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
- Side gutter mobile minimal 16px.

### 4.4 Komponen kunci

| Komponen | Referensi | Spesifikasi |
|---|---|---|
| **Button** | mtioon.com | Pill tebal dengan kedalaman 3D (shadow bawah solid). Waktu ditekan: `translateY` turun + shadow mengecil, terasa fisik. Varian: **solid hitam** & **outline**. Focus ring jelas. |
| **Section marker / progress** | brettmcm.com | Indikator vertikal di kiri, aktif sesuai section yang sedang dibaca. Klik untuk lompat. Dipakai di Home dan halaman case study. |
| **Playground card** | paper.design/mono | Kartu bergaya "window": title bar mono + tombol ×, border tipis, di atas kanvas grid. Bisa di-drag, dilempar (inertia), dan tumpang tindih (yang diklik naik ke atas). |
| **Work gallery** | labs.griflan.com | Galeri imersif: hover/scroll memunculkan gambar yang mengikuti kursor, transisi halus (shared element) ke halaman case study. |
| **Mascot** | mindmarket.com | Lihat bagian 5. |
| **Cursor** | Custom (opsional) | Lingkaran kecil hitam, membesar dengan label di atas item interaktif ("View", "Drag"). Mati otomatis di perangkat touch. |

---

## 5. Mascot

Karakter blob putih berbentuk lonjong dengan outline hitam tebal, mata dua titik, tangan dan kaki panjang yang lentur. **Ditambah kacamata.** Gayanya line-art hitam putih yang sama dengan sistem visual, jadi mascot adalah bagian dari brand, bukan tempelan.

**Kepribadian:** santai, sedikit malas, penasaran, gampang kaget.

### Behavior

| State | Pemicu | Gerakan |
|---|---|---|
| Idle | Default | Napas pelan, kedip acak, sesekali benerin kacamata |
| Look | Gerak kursor | Mata (dan kacamata) ngikutin kursor |
| Hover | Kursor di atas mascot | Kaget kecil / nengok |
| Click | Klik mascot | Reaksi lucu (guling, lompat), beberapa variasi acak |
| Bored | Tidak ada interaksi ±10 detik | Rebahan / main laptop |
| Scroll | Scroll cepat | Ikut "kebawa" (squash & stretch) |

### Pose per halaman

| Halaman | Pose |
|---|---|
| Home (hero) | Duduk / rebahan di sofa main laptop, bereaksi ke kursor |
| Work | Mengintip dari pinggir galeri |
| Playground | Nongkrong di atas salah satu kartu, ikut kebawa kalau kartunya di-drag |
| About | Pose "foto profil", pakai kacamata |
| Contact | Pegang/lempar amplop atau melambai |
| Loading | Guling-guling (pose lutut dipeluk) |
| 404 | Tengkurap lemas di sofa |

### Produksi

- Gambar ulang mascot sebagai **vektor** (Figma/Illustrator), **dipisah per layer**: badan, mata kiri, mata kanan, kacamata, tiap tangan, tiap kaki, bayangan.
- Animasi di **Rive** pakai **State Machine** dengan input dari kode: `pointerX`, `pointerY`, `isHover`, `click`, `page`, `idleTime`.
- Fallback: SVG statis untuk `prefers-reduced-motion` dan kalau Rive gagal dimuat.

---

## 6. Motion principles

| Prinsip | Aturan |
|---|---|
| **Purposeful** | Setiap animasi punya alasan: arahkan perhatian, kasih feedback, atau sambungkan konteks. |
| **Snappy UI, bouncy mascot** | UI cepat dan tegas, mascot elastis dan ekspresif. |
| **Physical** | Drag pakai inertia, button punya tekanan, kartu punya bobot. |
| **Interruptible** | Animasi bisa dipotong user kapan saja, tidak mengunci interaksi. |

**Token motion:**

| Token | Nilai | Pemakaian |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Masuk, reveal |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Page transition |
| `--spring-ui` | stiffness 400, damping 30 | Button, hover |
| `--spring-playful` | stiffness 200, damping 12 | Mascot, kartu playground |
| `--dur-fast` | 150ms | Hover, press |
| `--dur-base` | 300ms | Reveal komponen |
| `--dur-slow` | 600–900ms | Page transition, hero |

**Aturan wajib:**
- `prefers-reduced-motion`: matikan smooth scroll, parallax, dan gerak besar. Ganti dengan fade. Mascot tampil diam (SVG statis).
- Preloader maksimal ±1.5 detik, dan hanya di kunjungan pertama.
- Animasi cuma `transform` dan `opacity` sebisa mungkin.

---

## 7. Information architecture

Menu: **Home · Work · Playground · About · Contact**

```
/                 Home
/work             Work gallery
/work/[slug]      Case study
/playground       Kanvas eksplorasi (kartu bisa di-drag)
/about            Tentang Endah
/contact          Kontak
/404              Mascot rebahan
```

### Home
1. Hero: nama, positioning satu kalimat, mascot interaktif, CTA (View work / Get in touch).
2. `(01) Selected Work`: 3–4 project unggulan.
3. `(02) Playground`: teaser beberapa kartu, link ke Playground.
4. `(03) About`: ringkasan singkat + foto/mascot.
5. `(04) Contact`: CTA + email + sosial.
- Section marker di kiri.

### Work
- Galeri imersif ala Griflan Labs, filter ringan (opsional): `Product`, `Web`, `Mobile`.

### Case study (template)
1. Hero: judul, cover, role, timeline, tools, tim.
2. Overview: konteks & masalah.
3. Process: riset → insight → flow → wireframe → iterasi.
4. Key decisions & alasannya.
5. Final design (mockup).
6. Outcome / impact.
7. Reflection.
8. Next project.
- Section marker di kiri, progress membaca.

### Playground
- Kanvas grid penuh, kartu tersebar dan bisa di-drag/dilempar.
- Klik kartu → buka detail (modal/window yang membesar).
- Filter tag: `motion`, `3D`, `type`, `UI concept`, `interactive`.
- Tombol "Tidy up" untuk merapikan kartu jadi grid.
- Di mobile: jadi list/masonry yang bisa di-swipe (drag bebas tidak nyaman di layar kecil).

### About
- Bio dengan suara sendiri, foto, pengalaman, skill, tools, CV (PDF).

### Contact
- Email (klik untuk copy), sosial, link CV. Form opsional.

---

## 8. Tech stack

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router)** | URL + SEO + OG image per case study, page transition, code-split per halaman |
| Bahasa | **TypeScript** | Aman saat proyek membesar |
| Styling | **Tailwind CSS** + CSS variables | Token jadi sumber utama, cepat untuk vibe coding |
| Font | **Geist, Geist Mono, Geist Pixel** (paket `geist`) | Satu keluarga, free commercial use |
| Animasi scroll & timeline | **GSAP + ScrollTrigger** (+ SplitText) | Presisi untuk scroll storytelling, gratis penuh |
| Animasi UI & gesture | **Motion** (Framer Motion) | Drag kartu, layout animation, spring |
| Smooth scroll | **Lenis** | Standar situs kreatif |
| Mascot | **Rive** (`@rive-app/react-canvas`) | Animasi interaktif dengan state machine |
| Konten | **MDX** | Tambah project = tambah 1 file, bisa embed komponen interaktif |
| 3D (opsional, nanti) | React Three Fiber + drei | Hanya kalau ada kebutuhan jelas |
| Gambar | `next/image`, AVIF/WebP | Performa |
| Deploy | **VPS sendiri** (Caddy + systemd + GitHub Actions) | Server sudah ada, auto-deploy tiap push ke main |
| Analytics | Plausible / Umami | Lihat project mana yang paling dilihat |

**Alternatif:** Vite + React kalau mau setup paling minimal. Library animasinya sama, bisa migrasi ke Next nanti.

### Struktur folder (rencana)

```
app/
  (site)/page.tsx            Home
  work/page.tsx              Gallery
  work/[slug]/page.tsx       Case study
  playground/page.tsx
  about/page.tsx
  contact/page.tsx
  not-found.tsx
components/
  ui/          Button, Label, Divider, Cursor
  layout/      Grid, Header, SectionMarker, PageTransition
  mascot/      Mascot.tsx (Rive + fallback SVG)
  work/        WorkGallery, CaseStudyLayout
  playground/  Canvas, DraggableCard
content/
  work/*.mdx
  playground/*.mdx
lib/           motion tokens, hooks (useReducedMotion, useLenis)
public/
  mascot/      .riv + fallback .svg
  work/        gambar case study
styles/
  tokens.css   warna, spacing, tipografi, motion
```

---

## 9. Kualitas & aturan teknis

- **Performa:** Lighthouse 90+ di mobile. Lazy-load gambar dan Rive di bawah fold. LCP < 2.5s.
- **Accessibility:**
  - Semua interaksi bisa pakai keyboard (termasuk kartu playground: fokus + panah untuk geser, Enter untuk buka).
  - Kontras teks minimal AA (monokrom sudah aman, cek warna `--muted`).
  - Alt text di semua gambar. Mascot diberi `aria-hidden` karena dekoratif.
  - Focus ring terlihat jelas.
  - `prefers-reduced-motion` dihormati (lihat bagian 6).
- **Mobile:** Hover tidak ada di HP. Ganti dengan tap, scroll, atau tilt. Custom cursor mati di touch.
- **SEO:** metadata + OG image per halaman dan per case study.
- **Konten mudah ditambah:** project baru dan eksplorasi baru cukup dengan satu file MDX.

---

## 10. Aset yang perlu disiapkan

- [ ] Mascot versi vektor + kacamata, dipisah per layer
- [ ] Pose mascot per halaman (lihat bagian 5)
- [ ] 3–4 case study terpilih dari portfolio lama (endahdesign.framer.ai), teks dirapikan ke template bagian 7
- [ ] Mockup resolusi tinggi per case study (video menyusul, tidak wajib di awal)
- [ ] Aset playground (gambar dulu, video/demo interaktif menyusul) + tag per item
- [ ] Positioning satu kalimat
- [ ] Bio, foto, CV PDF, link sosial
- [ ] Nama domain

---

## 11. Roadmap

1. **Foundation:** scaffold Next.js, token (warna, font, spacing, motion), grid, Button.
2. **Layout:** header/nav, section marker, page transition, Lenis.
3. **Konten statis:** semua halaman terisi lengkap tanpa animasi besar, lalu deploy.
4. **Work:** gallery imersif + template case study.
5. **Playground:** kanvas + kartu draggable.
6. **Mascot:** Rive state machine, dipasang di Home dulu, lalu halaman lain.
7. **Polish:** performa, a11y, mobile, reduced-motion, OG image.
8. **Test** ke 3–5 orang (termasuk non-designer), iterasi, lalu launch.

---

## 12. Referensi

| Elemen | Situs |
|---|---|
| Grid editorial | https://helloprokhorov.com/ |
| Button | https://mtioon.com/ |
| Playground cards | https://paper.design/mono |
| Section marker / progress | https://brettmcm.com/ |
| Work gallery | https://labs.griflan.com/ |
| Mascot hidup | https://mindmarket.com/ |
| Portfolio lama | https://endahdesign.framer.ai/ |
