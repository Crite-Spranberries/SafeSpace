import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Asset } from 'expo-asset';

// Generic hook to preload images. Accepts an array of local requires (numbers)
// or remote URL strings. Returns a boolean `loaded` that becomes true when
// all images have been attempted to load (success or error).
export function usePreloadImages(images: Array<number | string> = []) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const localAssets = images.filter((i) => typeof i !== 'string') as number[];
        const remoteUris = images.filter((i) => typeof i === 'string') as string[];

        if (localAssets.length) {
          // Asset.loadAsync accepts an array of local require(...) assets
          await Asset.loadAsync(localAssets);
        }

        if (remoteUris.length) {
          await Promise.all(remoteUris.map((uri) => Image.prefetch(uri)));
        }
      } catch (err) {
        // Non-fatal; log for debugging
        // eslint-disable-next-line no-console
        console.warn('usePreloadImages: failed to preload images', err);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
    // JSON.stringify used for simple dependency check; arrays of requires stringify reliably here
  }, [JSON.stringify(images)]);

  return loaded;
}

export default usePreloadImages;
