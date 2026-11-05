import { useEffect, useRef, useState } from 'react';

export const useTextTruncation = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkTruncation = () => {
      setIsTruncated(
        element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight,
      );
    };

    checkTruncation();
    // A late web-font swap changes the text width but not the element's.
    document.fonts?.ready.then(checkTruncation);

    // Observe the element itself: its width also changes when the sidebar
    // toggles or the layout shifts, which no window resize event reports.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', checkTruncation);
      return () => window.removeEventListener('resize', checkTruncation);
    }
    const observer = new ResizeObserver(checkTruncation);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { textRef, isTruncated };
};
