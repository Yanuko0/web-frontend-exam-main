import { useEffect, useState } from 'react';

const GIVE_UP_MS = 10000;

/**
 * True once every image has finished loading (or failed, or `GIVE_UP_MS` has
 * passed), so a layered picture can be revealed all at once instead of showing
 * the small layers before the large ones.
 *
 * Each item is a URL or `{ src, srcSet, sizes }`; the same attributes are given
 * to the preloading image, so the browser fetches the variant that will be shown.
 */
export default function useImagesReady(images) {
  const [ready, setReady] = useState(false);
  const key = JSON.stringify(images);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setReady(true);
    };

    const loads = JSON.parse(key).map((item) => new Promise((resolve) => {
      const { src, srcSet, sizes } = typeof item === 'string' ? { src: item } : item;
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve; // a broken layer must not block the page forever
      if (sizes) image.sizes = sizes;
      if (srcSet) image.srcset = srcSet;
      image.src = src;
    }));

    const timer = setTimeout(finish, GIVE_UP_MS);
    Promise.all(loads).then(() => {
      clearTimeout(timer);
      finish();
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key]);

  return ready;
}
