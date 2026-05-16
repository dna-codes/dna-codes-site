/**
 * dna-visual.js
 *
 * Three-phase SVG.js v3 animation for the dna.codes marketing hero.
 * Phases: sound wave → DNA double helix → abstract nested list (loops)
 *
 * Peer dependency: SVG.js v3
 *   CDN: https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@3/dist/svg.min.js
 *   Must be available as the global `SVG` before this script runs.
 *
 * Usage:
 *   initDnaVisual(document.getElementById('dna-visual'))
 *
 * ViewBox: 0 0 400 560  (portrait, scales to container width)
 */
(function (root) {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────────
  const VB_W   = 400;
  const VB_H   = 560;
  const N      = 8;          // circle count — invariant across all phases
  const R      = 12;         // base circle radius (px in viewBox space)
  const COLOR  = '#2DD4BF';  // teal-400
  const LINE_OPX = 0.5;      // Phase 3 label line opacity
  const STEPS  = 60;         // path point count (same for all paths)

  // Phase durations (ms)
  const P1  = 3500;
  const T12 = 1000;
  const P2  = 4000;
  const T23 = 1200;
  const P3  = 3500;
  const T31 = 800;

  // Wave geometry (Phase 1)
  const W_AMP  = 50;
  const W_FREQ = 0.02;
  const W_SPD  = 0.05;    // time offset increment per frame
  const W_CY   = VB_H * 0.5;  // 280 — wave center y

  // Helix geometry (Phase 2)
  const H_AMP  = 60;
  const H_FREQ = 0.025;
  const H_SPD  = 0.04;
  const H_CY   = VB_H * 0.4;  // 224 — helix center y

  // Phase 3 bullet layout: 3 top-level (x=40), 5 nested (x=72); y 120–460
  const BULLETS = [
    { x: 40, lineLen: 120 },
    { x: 72, lineLen: 90  },
    { x: 72, lineLen: 80  },
    { x: 40, lineLen: 130 },
    { x: 72, lineLen: 85  },
    { x: 72, lineLen: 75  },
    { x: 72, lineLen: 70  },
    { x: 40, lineLen: 110 },
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function bulletPositions() {
    const step = (460 - 120) / (N - 1);
    return BULLETS.map((b, i) => ({ cx: b.x, cy: 120 + i * step, lineLen: b.lineLen }));
  }

  // Audio/sonic waveform: sum of harmonics with a breathing amplitude envelope.
  // Produces a complex, irregular-looking wave that reads as "sound" rather than math.
  function audioY(x, t) {
    const env = 0.65 + 0.35 * Math.sin(t * 0.12);
    return W_CY + env * W_AMP * (
      0.50 * Math.sin(W_FREQ *  1.0 * x + t) +
      0.28 * Math.sin(W_FREQ *  2.7 * x + t * 1.37) +
      0.14 * Math.sin(W_FREQ *  5.4 * x - t * 0.83) +
      0.08 * Math.sin(W_FREQ *  9.1 * x + t * 2.11)
    );
  }

  function buildAudioPath(t) {
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const x = (i / STEPS) * VB_W;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + audioY(x, t).toFixed(1) + ' ';
    }
    return d.trim();
  }

  // helixY: y position on strand A (strandPhase=0) or B (strandPhase=Math.PI)
  function helixY(x, timeOffset, strandPhase) {
    return Math.sin(H_FREQ * x + timeOffset + strandPhase) * H_AMP + H_CY;
  }

  function buildHelixPath(timeOffset, strandPhase) {
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const x = (i / STEPS) * VB_W;
      const y = helixY(x, timeOffset, strandPhase);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    return d.trim();
  }

  // ── Entry point ──────────────────────────────────────────────────────────────

  function initDnaVisual(el) {
    const S = (typeof SVG === 'function') ? SVG : root.SVG;
    if (!S) {
      console.error('dna-visual: SVG.js v3 is required (global `SVG` not found)');
      return;
    }

    // ── SVG setup ──────────────────────────────────────────────────────────────
    const draw = S()
      .addTo(el)
      .attr({ width: '100%', height: 'auto', preserveAspectRatio: 'xMidYMid meet' })
      .viewbox(0, 0, VB_W, VB_H);

    // ── 2 backbone paths (reused Phase 1 wave + Phase 2 helix) ────────────────
    const pA = draw.path('M0 0').fill('none').stroke({ color: COLOR, width: 2 });
    const pB = draw.path('M0 0').fill('none').stroke({ color: COLOR, width: 2 });

    // ── 3 extra wave paths (Phase 1 only; fade out during T1→2) ───────────────
    const wavePaths = [
      draw.path('M0 0').fill('none').stroke({ color: COLOR, width: 1.5 }).opacity(0.35),
      draw.path('M0 0').fill('none').stroke({ color: COLOR, width: 1.5 }).opacity(0.30),
      draw.path('M0 0').fill('none').stroke({ color: COLOR, width: 1.5 }).opacity(0.25),
    ];

    // ── 8 persistent ellipse elements (transparent fill, teal stroke) ─────────
    const circles = Array.from({ length: N }, () =>
      draw.ellipse(R * 2, R * 2)
        .fill('none')
        .stroke({ color: COLOR, width: 2 })
    );

    // ── 8 extra helix circles (Phase 2 only; fill gaps between main circles) ────
    const helixExtras = Array.from({ length: N }, () =>
      draw.ellipse(R * 2, R * 2)
        .fill('none')
        .stroke({ color: COLOR, width: 2 })
        .opacity(0)
    );

    // ── 8 label lines (Phase 3; hidden initially) ─────────────────────────────
    const bpos = bulletPositions();
    const llines = Array.from({ length: N }, () =>
      draw.line(0, 0, 0, 0).stroke({ color: COLOR, width: 2 }).opacity(0)
    );

    // ── Animation state ───────────────────────────────────────────────────────
    let phase = 1;
    let phaseStart = null;
    let t = 0;            // time offset for sin calculations
    let raf = null;
    let busy = false;     // true while a transition is running

    const stopRaf = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
    const startRaf = () => { stopRaf(); raf = requestAnimationFrame(tick); };

    // ── Phase 1 frame — audio / sonic wave ───────────────────────────────────
    function p1Frame() {
      t += W_SPD;
      pA.plot(buildAudioPath(t));
      circles.forEach((c, i) => {
        const x = (i / (N - 1)) * VB_W;
        c.attr({ cx: x, cy: audioY(x, t), rx: R, ry: R });
      });
    }

    // ── Phase 2 frame — DNA double helix ──────────────────────────────────────
    // Main circles at (i+0.5)/N intervals, alternating strands A/B.
    // Extra circles interleave at i/N intervals (25px offset), same alternation.
    // Combined: 8 circles per strand, spaced 25px apart across the full width.
    function p2Frame() {
      t += H_SPD;
      pA.plot(buildHelixPath(t, 0));
      pB.plot(buildHelixPath(t, Math.PI));

      circles.forEach((c, i) => {
        const x = ((i + 0.5) / N) * VB_W;
        const strand = i % 2 === 0 ? 0 : Math.PI;
        c.attr({ cx: x, cy: helixY(x, t, strand), rx: R, ry: R });
      });

      helixExtras.forEach((c, j) => {
        const x = (j / N) * VB_W;
        const strand = j % 2 === 0 ? 0 : Math.PI;
        c.attr({ cx: x, cy: helixY(x, t, strand), rx: R, ry: R });
      });
    }

    // ── Transition: Phase 1 → Phase 2 ────────────────────────────────────────
    function startT12() {
      busy = true;
      stopRaf();
      const t0 = t;

      // Animate main circles from audio wave to their helix strand positions
      circles.forEach((c, i) => {
        const x = ((i + 0.5) / N) * VB_W;
        const strand = i % 2 === 0 ? 0 : Math.PI;
        c.animate(T12).attr({ cx: x, cy: helixY(x, t0, strand), rx: R, ry: R });
      });

      // Snap extra circles to their initial helix positions then fade in
      helixExtras.forEach((c, j) => {
        const x = (j / N) * VB_W;
        const strand = j % 2 === 0 ? 0 : Math.PI;
        c.attr({ cx: x, cy: helixY(x, t0, strand), rx: R, ry: R });
        c.animate(T12).opacity(1);
      });

      // Crossfade pA: audio → helix strand A
      pA.animate(T12 / 2).opacity(0);
      setTimeout(() => {
        pA.plot(buildHelixPath(t0, 0)).animate(T12 / 2).opacity(1);
      }, T12 / 2);

      // Fade pB in as helix strand B (was hidden during Phase 1)
      pB.plot(buildHelixPath(t0, Math.PI)).animate(T12).opacity(1);

      setTimeout(() => {
        busy = false;
        phase = 2;
        phaseStart = null;
        t = t0;
        startRaf();
      }, T12);
    }

    // ── Transition: Phase 2 → Phase 3 ────────────────────────────────────────
    function startT23() {
      busy = true;
      stopRaf();

      // Fade out strand paths and extra helix circles
      pA.animate(T23).opacity(0);
      pB.animate(T23).opacity(0);
      helixExtras.forEach(c => c.animate(T23 * 0.6).opacity(0));

      // FLIP: animate each circle from helix position to its bullet list position;
      // simultaneously normalize to uniform circles (rx = ry = R)
      circles.forEach((c, i) =>
        c.animate(T23).attr({ cx: bpos[i].cx, cy: bpos[i].cy, rx: R, ry: R })
      );

      setTimeout(() => {
        // Wire and stagger-in label lines after circles settle
        llines.forEach((l, i) => {
          const x1 = bpos[i].cx + R + 8;
          l.plot(x1, bpos[i].cy, x1 + bpos[i].lineLen, bpos[i].cy).opacity(0);
          setTimeout(() => l.animate(300).opacity(LINE_OPX), i * 50);
        });

        busy = false;
        phase = 3;
        phaseStart = null;
        startRaf();
      }, T23);
    }

    // ── Transition: Phase 3 → Phase 1 (loop restart) ─────────────────────────
    function startT31() {
      busy = true;
      stopRaf();
      const half = T31 / 2;

      // Fade everything out (helixExtras already hidden from T23)
      llines.forEach(l => l.animate(half).opacity(0));
      circles.forEach(c => c.animate(half).opacity(0));
      helixExtras.forEach(c => c.opacity(0));
      pA.animate(half).opacity(0);
      pB.animate(half).opacity(0);
      wavePaths.forEach(p => p.animate(half).opacity(0));

      setTimeout(() => {
        // Reset time and reposition all elements at Phase 1 starting state
        t = 0;
        circles.forEach((c, i) => {
          const x = (i / (N - 1)) * VB_W;
          c.attr({ cx: x, cy: audioY(x, 0), rx: R, ry: R });
        });
        pA.plot(buildAudioPath(0));
        pB.opacity(0);  // stays hidden until T12

        // Fade audio path and circles back in
        pA.animate(half).opacity(1);
        circles.forEach(c => c.animate(half).opacity(1));

        setTimeout(() => {
          busy = false;
          phase = 1;
          phaseStart = null;
          startRaf();
        }, half);
      }, half);
    }

    // ── Main rAF tick ─────────────────────────────────────────────────────────
    function tick(ts) {
      // Pause when tab is hidden (resume via visibilitychange listener)
      if (document.hidden) { raf = null; return; }

      if (!phaseStart) phaseStart = ts;
      const elapsed = ts - phaseStart;

      // Each phase is a still frame — tick only drives timing, not per-frame updates.
      if      (phase === 1 && elapsed >= P1) { phase = 'tx'; startT12(); return; }
      else if (phase === 2 && elapsed >= P2) { phase = 'tx'; startT23(); return; }
      else if (phase === 3 && elapsed >= P3) { phase = 'tx'; startT31(); return; }

      raf = requestAnimationFrame(tick);
    }

    // ── Tab visibility: pause rAF when hidden, resume when visible ────────────
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopRaf();
      } else if (!busy) {
        phaseStart = null;  // don't count hidden time against phase duration
        startRaf();
      }
    });

    // ── Init: pB and wavePaths are hidden in Phase 1 ─────────────────────────
    pB.opacity(0);
    wavePaths.forEach(p => p.opacity(0));

    // Draw Phase 1 once — static from here until T12
    pA.plot(buildAudioPath(0));
    circles.forEach((c, i) => {
      const x = (i / (N - 1)) * VB_W;
      c.attr({ cx: x, cy: audioY(x, 0), rx: R, ry: R });
    });

    startRaf();
  }

  // ── Expose ────────────────────────────────────────────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initDnaVisual };
  } else {
    root.initDnaVisual = initDnaVisual;
  }

}(typeof globalThis !== 'undefined' ? globalThis : this));
