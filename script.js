// ── Scroll-morphing canvas background ──
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let W, H;

// Scroll stages: [bg base color, orb1 color, orb2 color]
const stages = [
  { base: [245, 240, 232], o1: [180, 220, 190], o2: [255, 235, 160] }, // cream + mint + gold — hero
  { base: [236, 245, 238], o1: [120, 200, 140], o2: [200, 235, 210] }, // fresh green — about
  { base: [232, 240, 250], o1: [160, 195, 240], o2: [190, 230, 200] }, // cool blue — who
  { base: [245, 235, 248], o1: [210, 175, 230], o2: [150, 210, 170] }, // dusk lavender — cta
];

let o1x = 0.2,
  o1y = 0.25,
  v1x = 0.00014,
  v1y = 0.00009;
let o2x = 0.78,
  o2y = 0.7,
  v2x = -0.00011,
  v2y = 0.00014;

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

const lerp = (a, b, t) => a + (b - a) * t;
const lerpRGB = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function progress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? Math.min(scrollY / max, 1) : 0;
}

function blend(t) {
  const n = stages.length - 1;
  const s = t * n,
    i = Math.min(Math.floor(s), n - 1),
    f = s - i;
  const a = stages[i],
    b = stages[Math.min(i + 1, n)];
  return {
    base: lerpRGB(a.base, b.base, f),
    o1: lerpRGB(a.o1, b.o1, f),
    o2: lerpRGB(a.o2, b.o2, f),
  };
}

function draw() {
  // drift orbs
  o1x += v1x;
  o1y += v1y;
  o2x += v2x;
  o2y += v2y;
  if (o1x < 0.05 || o1x > 0.95) v1x *= -1;
  if (o1y < 0.05 || o1y > 0.95) v1y *= -1;
  if (o2x < 0.05 || o2x > 0.95) v2x *= -1;
  if (o2y < 0.05 || o2y > 0.95) v2y *= -1;

  const p = progress();
  const { base, o1, o2 } = blend(p);

  // solid base
  ctx.fillStyle = rgba(base, 1);
  ctx.fillRect(0, 0, W, H);

  // orb 1
  const g1 = ctx.createRadialGradient(
    o1x * W,
    o1y * H,
    0,
    o1x * W,
    o1y * H,
    Math.max(W, H) * 0.65,
  );
  g1.addColorStop(0, rgba(o1, 0.55));
  g1.addColorStop(1, rgba(o1, 0));
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // orb 2
  const g2 = ctx.createRadialGradient(
    o2x * W,
    o2y * H,
    0,
    o2x * W,
    o2y * H,
    Math.max(W, H) * 0.5,
  );
  g2.addColorStop(0, rgba(o2, 0.45));
  g2.addColorStop(1, rgba(o2, 0));
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(draw);
}
draw();
