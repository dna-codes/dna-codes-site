import { getImage } from 'astro:assets';
// Captured from the live miniature on /ui-operations rather than from the product
// screenshots in this folder: every one of those has a light host application, which next to
// the dark core panel made the pair look like two unrelated sites.
import overlayShot from '~/assets/images/overlay/panel-on-dark-app.png';
import operationsShot from '~/assets/images/operations/process-flow-output.png';

export { operationsShot, overlayShot };

// The homepage cards and the <head> preloads have to describe the same files.
// A mismatch makes the browser download each shot twice.
export const productShotWidths = [520, 1040];
export const productShotSizes = '(min-width: 1024px) 380px, (min-width: 768px) 480px, 100vw';

export const productShotPreloads = await Promise.all(
  [operationsShot, overlayShot].map((src) =>
    getImage({
      src,
      widths: productShotWidths,
      format: 'webp',
    })
  )
);
