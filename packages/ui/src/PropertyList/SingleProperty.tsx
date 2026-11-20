import { FC, ReactNode, useId } from 'react';

import { cn } from '../cn';

import {
  hasContent,
  renderPropertyPlaceholder,
  resolveTermWidth,
  TermLabel,
} from './internals';
import { SPACE_CLASSES, type PropertySpace } from './scales';
import {
  isFormattedProperty,
  type PropertyItemValue,
  type PropertyPlaceholderValue,
  type TermWidthPreset,
} from './types';

export interface SinglePropertyProps {
  label: ReactNode;
  /** A node or a `propVal.*` formatted property. */
  value: PropertyItemValue;
  /**
   * `summary` (default): the term and value inline, with a colon, as a row
   * of a summary list. `divided`: as a row of a property sheet.
   */
  variant?: 'summary' | 'divided';
  /** The term column's width in `summary`, as a list's `termWidth`. */
  termWidth?: TermWidthPreset | string;
  /** Bottom margin in `summary`, as a list's `space`. */
  space?: PropertySpace;
  /**
   * Leave the property out when its value is empty. Defaults to true in
   * `summary`, false in `divided`; a kept empty value shows `placeholder`.
   */
  hideIfEmpty?: boolean;
  /** Shown for an empty value that is kept; a dash by default. */
  placeholder?: PropertyPlaceholderValue;
  labelClass?: string;
  valueClass?: string;
  className?: string;
  'data-testid'?: string;
}

/**
 * One label and its value, where a `PropertyList` would hold a single row.
 * It is its own `<dl>` with the `<dt>`/`<dd>` (named by the term) a list row
 * renders, laid out like a row of a `summary` or `divided` list, so it reads
 * and looks the same without a one-item list around it.
 */
export const SingleProperty: FC<SinglePropertyProps> = ({
  label,
  value,
  variant = 'summary',
  termWidth,
  space = 1,
  hideIfEmpty,
  placeholder,
  labelClass,
  valueClass,
  className,
  'data-testid': testId,
}) => {
  const termId = useId();
  const empty = !hasContent(value);
  const hasCustomPlaceholder =
    placeholder !== undefined && placeholder !== 'dash';
  if (
    empty &&
    (hideIfEmpty ?? (variant === 'summary' && !hasCustomPlaceholder))
  ) {
    return null;
  }
  const shown = empty
    ? renderPropertyPlaceholder(placeholder)
    : isFormattedProperty(value)
      ? value.node
      : value;

  if (variant === 'divided') {
    return (
      <dl
        data-slot="single-property"
        data-testid={testId}
        className={cn(
          'm-0 grid min-h-[52px] w-full grid-cols-1 items-center gap-x-6 gap-y-1 py-4 text-sm page-sm:grid-cols-[minmax(150px,25%)_1fr] page-md:grid-cols-[minmax(200px,25%)_1fr]',
          className,
        )}
      >
        <dt
          data-slot="property-term"
          className={cn(
            'm-0 min-w-0 font-medium leading-5 text-secondary',
            labelClass,
          )}
        >
          <TermLabel termId={termId} className="mb-0" label={label} />
        </dt>
        <dd
          data-slot="property-value"
          aria-labelledby={termId}
          className={cn(
            'm-0 min-w-0 leading-5 text-tertiary wrap-break-word',
            valueClass,
          )}
        >
          {shown}
        </dd>
      </dl>
    );
  }

  const width = resolveTermWidth(termWidth ?? 'md');
  return (
    <dl
      data-slot="single-property"
      data-testid={testId}
      style={{ '--dt-width': width } as React.CSSProperties}
      className={cn(
        'm-0 flex flex-wrap items-baseline text-sm page-sm:grid page-sm:grid-cols-[var(--dt-width)_minmax(0,1fr)] page-sm:gap-6',
        SPACE_CLASSES[space],
        className,
      )}
    >
      <dt
        data-slot="property-term"
        className={cn(
          'm-0 w-full font-medium break-words text-secondary page-sm:w-auto',
          labelClass,
        )}
      >
        <TermLabel
          termId={termId}
          className="mb-0"
          label={label}
          colon={typeof label === 'string'}
          tooltipLen={20}
        />
      </dt>
      <dd
        data-slot="property-value"
        aria-labelledby={termId}
        className={cn(
          'm-0 w-full text-quaternary wrap-break-word page-sm:w-auto [&_p]:m-0',
          valueClass,
        )}
      >
        {shown}
      </dd>
    </dl>
  );
};
