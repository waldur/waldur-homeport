import { debounce, uniqueId } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';

const LETTER_WIDTH = 7.1; // px - approximate width per character

export const TruncatedText = ({
  text,
  tooltipText = null,
  min = 19,
  padding = 0,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tipId = useRef('tip-truncated-' + uniqueId());
  // Store the original text in a ref to avoid dependency issues
  const textRef = useRef(text);
  textRef.current = text;

  const checkWidth = useCallback(() => {
    if (!containerRef.current) return;

    const currentText = textRef.current;

    // Find the breadcrumb item parent to get actual available width
    const breadcrumbItem = containerRef.current.closest('.breadcrumb-item');
    if (!breadcrumbItem) {
      // Fallback: show full text if we can't find breadcrumb container
      setDisplayText(currentText);
      setIsTruncated(false);
      return;
    }

    // Check if this is the last breadcrumb item (has flex-grow: 1)
    const isLastItem =
      breadcrumbItem.parentElement?.lastElementChild === breadcrumbItem;

    let availableWidth: number;

    if (isLastItem) {
      // Last item has flex-grow: 1, so its width is the available space
      const itemWidth = breadcrumbItem.getBoundingClientRect().width;
      availableWidth = Math.max(0, itemWidth - padding - 40);
    } else {
      // For non-last items, calculate available space from parent container
      const breadcrumbContainer = breadcrumbItem.closest('.breadcrumb');
      if (!breadcrumbContainer) {
        setDisplayText(currentText);
        setIsTruncated(false);
        return;
      }

      // Get total breadcrumb width and width of all siblings
      const containerWidth = breadcrumbContainer.getBoundingClientRect().width;
      const allItems = breadcrumbContainer.querySelectorAll('.breadcrumb-item');
      let siblingsWidth = 0;

      allItems.forEach((item) => {
        if (item !== breadcrumbItem) {
          const isItemLast = item === item.parentElement?.lastElementChild;
          if (isItemLast) {
            // For last item (has flex-grow), use content width not item width
            const content = item.querySelector('span, a');
            siblingsWidth += content?.getBoundingClientRect().width || 0;
            siblingsWidth += 40; // Buffer for dropdown arrow, padding
          } else {
            siblingsWidth += item.getBoundingClientRect().width;
          }
        }
      });

      // Available width is container minus siblings, with some buffer
      availableWidth = Math.max(
        0,
        containerWidth - siblingsWidth - padding - 60,
      );
    }

    const maxChars = Math.floor(availableWidth / LETTER_WIDTH);
    const maxLength = Math.max(min, maxChars);

    if (currentText.length <= maxLength) {
      // Text fits, no truncation needed
      setDisplayText(currentText);
      setIsTruncated(false);
    } else {
      // Text needs truncation
      setDisplayText(truncate(currentText, maxLength));
      setIsTruncated(true);
    }
  }, [min, padding]);

  // Debounced version for resize events
  const debouncedCheckWidth = useMemo(
    () => debounce(checkWidth, 100),
    [checkWidth],
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedCheckWidth);
    // Initial check after layout settles
    const timer = setTimeout(checkWidth, 150);
    return () => {
      window.removeEventListener('resize', debouncedCheckWidth);
      debouncedCheckWidth.cancel();
      clearTimeout(timer);
    };
  }, [checkWidth, debouncedCheckWidth]);

  // Re-check when text changes
  useEffect(() => {
    checkWidth();
  }, [text, checkWidth]);

  const content = <span ref={containerRef}>{displayText}</span>;

  if (isTruncated) {
    return (
      <Tip label={tooltipText || text} id={tipId.current} placement="bottom">
        {content}
      </Tip>
    );
  }

  return content;
};
