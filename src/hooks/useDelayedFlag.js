import { useEffect, useState } from 'react';

/**
 * Turns true only after `flag` has stayed true for `delay` ms, and false as
 * soon as it clears. Used to avoid flashing loaders on fast responses.
 */
export default function useDelayedFlag(flag, delay = 150) {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return undefined;
    }
    const timer = setTimeout(() => setDelayed(true), delay);
    return () => clearTimeout(timer);
  }, [flag, delay]);

  return delayed;
}
