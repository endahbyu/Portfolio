// Motion tokens for JS animation libraries (Motion, GSAP). Mirrors styles/tokens.css.
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const duration = {
  fast: 0.15,
  base: 0.3,
  slow: 0.7,
} as const;

export const spring = {
  ui: { type: "spring", stiffness: 400, damping: 30 },
  playful: { type: "spring", stiffness: 200, damping: 12 },
} as const;
