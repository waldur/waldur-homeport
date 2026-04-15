import { useEffect, useRef, useState } from 'react';

export const useTextTruncation = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current;
        const isOverflowing =
          element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight;
        setIsTruncated(isOverflowing);
      }
    };

    checkTruncation();

    // Re-check on window resize
    const handleResize = () => {
      checkTruncation();
    };

    window.addEventListener('resize', handleResize);

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkTruncation, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return { textRef, isTruncated };
};
