// Taken from https://www.aaron-powell.com/posts/2019-09-23-recursive-settimeout-with-react-hooks/
import { useEffect, useRef } from 'react';

// Wait until the last callback is completed before starting another interval timer
export function useRecursiveTimeout<T>(
  callback: () => Promise<T> | (() => void),
  delay: number | null,
) {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout loop.
  useEffect(() => {
    let id;
    function tick() {
      const ret = savedCallback.current();

      if (ret instanceof Promise) {
        ret.then(() => {
          if (delay !== null) {
            id = setTimeout(tick, delay);
          }
        });
      } else {
        if (delay !== null) {
          id = setTimeout(tick, delay);
        }
      }
    }
    if (delay !== null) {
      id = setTimeout(tick, delay);
      return () => id && clearTimeout(id);
    }
  }, [delay]);
}
