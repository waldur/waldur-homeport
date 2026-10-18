import { WarningCircleIcon } from '@phosphor-icons/react';
import {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '../cn';

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Drawn inside the field's left edge, e.g. a search icon. */
  start?: ReactNode;
  /** Drawn inside the field's right edge: a unit, steppers, a show/hide button. */
  end?: ReactNode;
  /** Draws a warning icon inside the right edge, before `end`. Set it with the
   * input's own `invalid`, which styles the border. */
  invalid?: boolean;
  /** Where the right-edge items sit: the middle of an Input, the top of a
   * Textarea. */
  align?: 'center' | 'top';
  /** The Input or Textarea. */
  children: ReactNode;
}

// The space between an adornment and the text (or the invalid icon).
const START_GAP = 8;
const END_GAP = 4;

const useWidth = (present: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!present || !el) {
      setWidth(0);
      return undefined;
    }
    const measure = () => setWidth(el.offsetWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [present]);
  return [ref, width] as const;
};

/**
 * Puts adornments inside an Input's borders. The input stays the real field
 * (every prop, the ref, the state styles); the group measures `start` and
 * `end` and sets `--input-start` / `--input-end`, which the input adds to its
 * padding, so the text and the invalid icon clear them whatever their width.
 * `invalid` adds the warning icon to the right edge, ahead of `end`.
 * Adornments are `pointer-events-none` unless they hold a control: give
 * interactive ones (buttons) `pointer-events-auto`.
 */
export const InputGroup = ({
  start,
  end,
  invalid,
  align = 'center',
  children,
  className,
  style,
  ...props
}: InputGroupProps) => {
  const [startRef, startWidth] = useWidth(Boolean(start));
  const hasEnd = Boolean(end) || Boolean(invalid);
  const [endRef, endWidth] = useWidth(hasEnd);
  const vars = {
    '--input-start': start ? `${startWidth + START_GAP}px` : undefined,
    '--input-end': hasEnd ? `${endWidth + END_GAP}px` : undefined,
  } as CSSProperties;
  return (
    <div
      className={cn('relative w-full', className)}
      style={{ ...vars, ...style }}
      {...props}
    >
      {children}
      {start && (
        <div
          ref={startRef}
          data-adornment="start"
          className="pointer-events-none absolute inset-y-0 left-[12px] z-[1] flex items-center text-quinary"
        >
          {start}
        </div>
      )}
      {hasEnd && (
        <div
          ref={endRef}
          data-adornment="end"
          className={cn(
            'pointer-events-none absolute inset-y-0 right-[12px] z-[1] flex gap-[6px] text-quaternary',
            align === 'top' ? 'items-start pt-[10px]' : 'items-center',
          )}
        >
          {invalid && (
            <WarningCircleIcon
              aria-hidden
              size={18}
              weight="bold"
              className="shrink-0 text-[var(--input-invalid-icon)]"
            />
          )}
          {end}
        </div>
      )}
    </div>
  );
};
