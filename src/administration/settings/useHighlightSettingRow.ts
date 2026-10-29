import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, useState } from 'react';

const HIGHLIGHT_DURATION_MS = 2500;

export const useHighlightSettingRow = (
  rowKey: string,
  elementIdPrefix = 'setting-',
): boolean => {
  const { params } = useCurrentStateAndParams();
  const isTarget = Boolean(rowKey && params?.setting === rowKey);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (!isTarget) return;

    setIsHighlighted(true);
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const frameId = requestAnimationFrame(() => {
      const element = document.getElementById(`${elementIdPrefix}${rowKey}`);
      if (element && typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      }
    });
    const timeoutId = setTimeout(
      () => setIsHighlighted(false),
      HIGHLIGHT_DURATION_MS,
    );

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      setIsHighlighted(false);
    };
  }, [isTarget, rowKey, elementIdPrefix]);

  return isHighlighted;
};
