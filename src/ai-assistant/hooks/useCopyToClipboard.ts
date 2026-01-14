import { useEffect, useRef, useState } from 'react';

export const useCopyToClipboard = (copiedDuration = 3000) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setIsCopied(true);
        // Clear any existing timeout before setting a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          () => setIsCopied(false),
          copiedDuration,
        );
      })
      .catch(() => {
        // Silently fail - clipboard errors are not critical
      });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isCopied, copyToClipboard };
};
