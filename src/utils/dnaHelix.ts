export type Orientation = 'vertical' | 'horizontal';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface DnaHelixOptions {
  orientation?: Orientation;
  nodeSize?: number;
  helixWidth?: number;
  speed?: number;
  color?: string | RGB;
  bgColor?: string | RGB;
  rungsPerTurn?: number;
  density?: number;
  rungSpacing?: number;
  lineWidth?: number;
  maxAlpha?: number;
  depthScale?: number;
  flare?: number;
}

export interface RenderDnaHelixSvgOptions extends DnaHelixOptions {
  width: number;
  height: number;
  phase?: number;
  background?: boolean;
  rungs?: number;
  rotation?: number;
}

const DEFAULTS = {
  orientation: 'vertical' as Orientation,
  nodeSize: 6.5,
  speed: 0.03,
  color: { r: 45, g: 212, b: 191 } as RGB,
  bgColor: { r: 10, g: 15, b: 30 } as RGB,
  rungsPerTurn: 10,
  density: 80,
  lineWidth: 1.5,
  maxAlpha: 0.55,
  depthScale: 0.5,
  flare: 0,
};

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function parseColor(c: string | RGB | undefined, fallback: RGB): RGB {
  if (c == null) return fallback;
  if (typeof c !== 'string') return c;
  const m = c.trim().match(HEX_RE);
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map((ch) => ch + ch)
      .join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgba(c: RGB, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a.toFixed(3)})`;
}

function rgb(c: RGB): string {
  return `rgb(${c.r},${c.g},${c.b})`;
}

interface Circle {
  x: number;
  y: number;
  r: number;
  z: number;
}

interface Rung {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineAlpha: number;
  c1: Circle;
  c2: Circle;
}

interface GeometryArgs {
  W: number;
  H: number;
  phase: number;
  orientation: Orientation;
  nodeSize: number;
  helixWidth: number | null;
  rungsPerTurn: number;
  density: number;
  rungSpacing: number | null;
  maxAlpha: number;
  depthScale: number;
  flare: number;
  rungs?: number;
}

function computeRungs(args: GeometryArgs): Rung[] {
  const isVertical = args.orientation === 'vertical';
  const mainLen = isVertical ? args.H : args.W;
  const oscLen = isVertical ? args.W : args.H;
  const autoPad = mainLen * (isVertical ? 0.05 : 0.02);
  const N_RUNGS = args.rungs ?? Math.max(args.rungsPerTurn, Math.round((mainLen - autoPad * 2) / args.density) + 1);
  let spacing: number;
  let pad: number;
  if (args.rungSpacing != null && N_RUNGS > 1) {
    spacing = args.rungSpacing;
    pad = (mainLen - spacing * (N_RUNGS - 1)) / 2;
  } else {
    spacing = N_RUNGS > 1 ? (mainLen - autoPad * 2) / (N_RUNGS - 1) : 0;
    pad = autoPad;
  }
  const center = oscLen / 2;
  const crossLen = isVertical ? args.W : args.H;
  const amp =
    args.helixWidth != null
      ? Math.min(args.helixWidth, crossLen * 0.32)
      : isVertical
        ? Math.min(args.W * 0.13, 68)
        : Math.min(args.H * 0.22, 80);
  const nodeR = Math.min(args.nodeSize, crossLen * 0.055);
  const pitch = (2 * Math.PI) / args.rungsPerTurn;

  const out: Rung[] = [];
  const centerIdx = (N_RUNGS - 1) / 2;
  for (let i = 0; i < N_RUNGS; i++) {
    const theta = args.phase + (i - centerIdx) * pitch;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const main = pad + i * spacing;
    const tNorm = N_RUNGS > 1 ? i / (N_RUNGS - 1) : 0.5;
    const flareMul = 1 + args.flare * Math.cos(Math.PI * tNorm) ** 2;
    const ampI = amp * flareMul;
    const oscA = center + ampI * cosT;
    const oscB = center - ampI * cosT;
    const x1 = isVertical ? oscA : main;
    const y1 = isVertical ? main : oscA;
    const x2 = isVertical ? oscB : main;
    const y2 = isVertical ? main : oscB;
    const lineAlpha = args.maxAlpha * (0.4 + 0.6 * Math.abs(cosT));
    out.push({
      x1,
      y1,
      x2,
      y2,
      lineAlpha,
      c1: { x: x1, y: y1, r: nodeR * (1 + args.depthScale * sinT), z: sinT },
      c2: { x: x2, y: y2, r: nodeR * (1 + args.depthScale * -sinT), z: -sinT },
    });
  }
  return out;
}

function resolveOpts(opts: DnaHelixOptions) {
  return {
    orientation: opts.orientation ?? DEFAULTS.orientation,
    nodeSize: opts.nodeSize ?? DEFAULTS.nodeSize,
    helixWidth: opts.helixWidth ?? null,
    speed: opts.speed ?? DEFAULTS.speed,
    color: parseColor(opts.color, DEFAULTS.color),
    bgColor: parseColor(opts.bgColor, DEFAULTS.bgColor),
    rungsPerTurn: opts.rungsPerTurn ?? DEFAULTS.rungsPerTurn,
    density: opts.density ?? DEFAULTS.density,
    rungSpacing: opts.rungSpacing ?? null,
    lineWidth: opts.lineWidth ?? DEFAULTS.lineWidth,
    maxAlpha: opts.maxAlpha ?? DEFAULTS.maxAlpha,
    depthScale: opts.depthScale ?? DEFAULTS.depthScale,
    flare: opts.flare ?? DEFAULTS.flare,
  };
}

/**
 * Mount an animated DNA helix canvas inside `el`. Returns a dispose function
 * that cancels the animation and removes the canvas.
 */
export function mountDnaHelixCanvas(el: HTMLElement, opts: DnaHelixOptions = {}): () => void {
  const o = resolveOpts(opts);

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
  if (!el.style.position) el.style.position = 'relative';
  el.insertBefore(canvas, el.firstChild);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return () => canvas.remove();
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  let raf = 0;
  let disposed = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = el.getBoundingClientRect();
    W = r.width || window.innerWidth;
    H = r.height || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  let observer: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(resize);
    observer.observe(el);
  }
  resize();

  function frame(ts: number) {
    if (disposed) return;
    if (document.hidden) {
      raf = 0;
      return;
    }
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.save();
    ctx!.scale(dpr, dpr);

    const phase = ts * 0.001 * o.speed * 2 * Math.PI;
    const rungs = computeRungs({
      W,
      H,
      phase,
      orientation: o.orientation,
      nodeSize: o.nodeSize,
      helixWidth: o.helixWidth,
      rungsPerTurn: o.rungsPerTurn,
      density: o.density,
      rungSpacing: o.rungSpacing,
      maxAlpha: o.maxAlpha,
      depthScale: o.depthScale,
      flare: o.flare,
    });

    const circles: Circle[] = [];
    for (const rg of rungs) {
      ctx!.beginPath();
      ctx!.moveTo(rg.x1, rg.y1);
      ctx!.lineTo(rg.x2, rg.y2);
      ctx!.strokeStyle = rgba(o.color, rg.lineAlpha);
      ctx!.lineWidth = o.lineWidth;
      ctx!.stroke();
      circles.push(rg.c1, rg.c2);
    }

    circles.sort((a, b) => a.z - b.z);
    for (const c of circles) {
      const sA = o.maxAlpha * (0.35 + 0.65 * (c.z + 1) * 0.5);
      const t = 0.35 + 0.65 * Math.pow((c.z + 1) / 2, 2);
      const fR = Math.round(o.bgColor.r + (o.color.r - o.bgColor.r) * t);
      const fG = Math.round(o.bgColor.g + (o.color.g - o.bgColor.g) * t);
      const fB = Math.round(o.bgColor.b + (o.color.b - o.bgColor.b) * t);
      ctx!.beginPath();
      ctx!.arc(c.x, c.y, Math.max(c.r, 0.5), 0, 6.283185);
      ctx!.fillStyle = `rgb(${fR},${fG},${fB})`;
      ctx!.strokeStyle = rgba(o.color, sA);
      ctx!.lineWidth = o.lineWidth;
      ctx!.fill();
      ctx!.stroke();
    }

    ctx!.restore();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  }

  const onVis = () => {
    if (!document.hidden) start();
  };
  document.addEventListener('visibilitychange', onVis);
  start();

  return function dispose() {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVis);
    observer?.disconnect();
    canvas.remove();
  };
}

/**
 * Render a single-frame DNA helix as an SVG string. Useful for logos,
 * favicons, social previews — anywhere a canvas + JS would be overkill.
 */
export function renderDnaHelixSvg(opts: RenderDnaHelixSvgOptions): string {
  const o = resolveOpts(opts);
  const W = opts.width;
  const H = opts.height;
  const phase = opts.phase ?? 0;

  const rungs = computeRungs({
    W,
    H,
    phase,
    orientation: o.orientation,
    nodeSize: o.nodeSize,
    helixWidth: o.helixWidth,
    rungsPerTurn: o.rungsPerTurn,
    density: o.density,
    rungSpacing: o.rungSpacing,
    maxAlpha: o.maxAlpha,
    depthScale: o.depthScale,
    flare: o.flare,
    rungs: opts.rungs,
  });

  const rotation = opts.rotation ?? 0;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" overflow="visible">`
  );
  if (opts.background) {
    parts.push(`<rect width="${W}" height="${H}" fill="${rgb(o.bgColor)}" />`);
  }

  if (rotation) {
    parts.push(`<g transform="rotate(${rotation} ${(W / 2).toFixed(2)} ${(H / 2).toFixed(2)})">`);
  }

  const circles: Circle[] = [];
  for (const rg of rungs) {
    parts.push(
      `<line x1="${rg.x1.toFixed(2)}" y1="${rg.y1.toFixed(2)}" x2="${rg.x2.toFixed(2)}" y2="${rg.y2.toFixed(2)}" stroke="${rgba(o.color, rg.lineAlpha)}" stroke-width="${o.lineWidth}" stroke-linecap="round" />`
    );
    circles.push(rg.c1, rg.c2);
  }
  circles.sort((a, b) => a.z - b.z);
  for (const c of circles) {
    const sA = o.maxAlpha * (0.35 + 0.65 * (c.z + 1) * 0.5);
    const t = 0.35 + 0.65 * Math.pow((c.z + 1) / 2, 2);
    const fR = Math.round(o.bgColor.r + (o.color.r - o.bgColor.r) * t);
    const fG = Math.round(o.bgColor.g + (o.color.g - o.bgColor.g) * t);
    const fB = Math.round(o.bgColor.b + (o.color.b - o.bgColor.b) * t);
    parts.push(
      `<circle cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="${Math.max(c.r, 0.5).toFixed(2)}" fill="rgb(${fR},${fG},${fB})" stroke="${rgba(o.color, sA)}" stroke-width="${o.lineWidth}" />`
    );
  }
  if (rotation) parts.push('</g>');
  parts.push('</svg>');
  return parts.join('');
}
