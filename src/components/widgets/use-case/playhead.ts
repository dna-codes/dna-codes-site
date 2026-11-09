// Advances a use-case visual through its steps. A click holds the current step.
// Hover pauses so the sentence can be read. Reduced motion never starts the timer.

const DEFAULT_INTERVAL = 2600;

export function attachPlayhead(root: HTMLElement): void {
  if (root.dataset.playheadBound === 'true') return;
  root.dataset.playheadBound = 'true';

  const steps = [...root.querySelectorAll<HTMLButtonElement>('[data-step]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const joins = [...root.querySelectorAll<HTMLElement>('[data-join]')];
  const play = root.querySelector<HTMLButtonElement>('[data-play]');
  const track = root.querySelector<HTMLElement>('[data-track]');
  if (steps.length === 0) return;

  let index = 0;
  let timer = 0;
  let pinned = false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const requested = Number(root.dataset.interval);
  const interval = Number.isFinite(requested) && requested >= 1000 ? requested : DEFAULT_INTERVAL;

  const setPlaying = (playing: boolean) => {
    if (!play) return;
    play.hidden = reduce;
    play.setAttribute('aria-pressed', playing ? 'true' : 'false');
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-label', playing ? 'Pause the process' : 'Play the process');
  };

  const reveal = (node: HTMLButtonElement) => {
    if (!track || track.scrollWidth <= track.clientWidth + 8) return;
    const nodeRect = node.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const delta = nodeRect.left - trackRect.left - (trackRect.width - nodeRect.width) / 2;
    track.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
  };

  const show = (next: number, scroll: boolean) => {
    index = (next + steps.length) % steps.length;
    steps.forEach((step, i) => {
      const on = i === index;
      step.setAttribute('aria-pressed', on ? 'true' : 'false');
      step.classList.toggle('is-current', on);
      step.classList.toggle('is-done', i < index);
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== String(index);
    });
    joins.forEach((join) => {
      const at = Number(join.dataset.join);
      join.classList.toggle('is-done', at <= index);
      join.classList.toggle('is-current', at === index);
    });
    if (scroll) reveal(steps[index]);
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
    setPlaying(false);
  };

  const start = () => {
    if (reduce || pinned || timer) return;
    setPlaying(true);
    timer = window.setInterval(() => show(index + 1, true), interval);
  };

  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      pinned = true;
      stop();
      show(i, true);
    });
  });

  play?.addEventListener('click', () => {
    if (timer) {
      pinned = true;
      stop();
    } else {
      pinned = false;
      show(index, false);
      start();
    }
  });

  root.addEventListener('mouseenter', () => {
    if (!pinned) stop();
  });
  root.addEventListener('mouseleave', () => {
    if (!pinned) start();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!pinned) stop();
    } else if (!pinned) start();
  });

  show(0, false);
  if (reduce) setPlaying(false);
  else start();
}
