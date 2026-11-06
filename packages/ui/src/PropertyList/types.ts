import { HTMLAttributes, ReactNode } from 'react';

import type { PropertySpace } from './scales';

export type { PropertySpace };

export type PropertyListVariant = 'divided' | 'summary' | 'compact';

/**
 * Contract returned by any data formatter in propVal.*
 */
export interface FormattedProperty {
  readonly __isFormattedProperty: true;
  /** Rendered React tree inside <dd> */
  readonly node: ReactNode;
  /** Pure text representation for clipboard copying */
  readonly text: string;
}

export const isFormattedProperty = (
  value: unknown,
): value is FormattedProperty =>
  typeof value === 'object' &&
  value !== null &&
  '__isFormattedProperty' in value &&
  (value as FormattedProperty).__isFormattedProperty === true;

export type PropertyItemValue = ReactNode | FormattedProperty;

export type AutoCopyableValue =
  string | number | boolean | Date | FormattedProperty | null | undefined;

export type PropertyRawValue = AutoCopyableValue | ReactNode;

export type TermWidthPreset = 'sm' | 'md' | 'lg' | 'xl';

export type PlaceholderPreset = 'dash' | 'none' | 'not-set' | 'optional' | 'na';

export type PropertyPlaceholderValue = ReactNode | PlaceholderPreset;

export interface PropertyListContextValue {
  insideList: boolean;
  variant: PropertyListVariant;
  detailsMode?: boolean;
  alignTop?: boolean;
  hideActions?: boolean;
  ellipsis?: boolean;
  space?: PropertySpace;
  termWidth?: string;
  /** Summary layout: term above value in one column, no term track. */
  stacked?: boolean;
  /** Classes merged into every item's term / value cell, before its own. */
  labelClass?: string;
  valueClass?: string;
  /** Fallback placeholder for empty items in this list. */
  emptyPlaceholder?: PropertyPlaceholderValue;
  /** Default policy for omitting empty items across this list. */
  hideIfEmpty?: boolean;
}

export interface PropertyListProps extends HTMLAttributes<HTMLElement> {
  /** Root element tag. Defaults to 'dl' for flat lists and 'div' for sectioned lists. */
  as?: 'dl' | 'div' | 'section';
  /**
   * Layout variant:
   * - `divided` (default): full-width rows with bottom borders, optional
   *   descriptions under terms, and an optional actions column.
   * - `summary`: aligned two-column property list without borders; omits
   *   empty values by default (`0` is shown).
   * - `compact`: tight key-left / value-right rows for stat cards and popovers.
   */
  variant?: PropertyListVariant;
  /** Medium titles in `text-secondary` and muted values in `text-quaternary`. */
  detailsMode?: boolean;
  /** Top-align term, value, and actions instead of centering them vertically. */
  alignTop?: boolean;
  /** Truncate values with an ellipsis instead of wrapping. */
  ellipsis?: boolean;
  /** Omit the actions slot across all items in the list. */
  hideActions?: boolean;
  /** Summary layout: bottom margin step (defaults to 1 -> `mb-1`). */
  space?: PropertySpace;
  /**
   * Fixed column width for the term (<dt>) column.
   * Presets: sm (160px), md (200px), lg (240px), xl (288px) or CSS string ('220px', '14rem').
   * Sets --dt-width CSS variable and aligns columns across independent lists.
   */
  termWidth?: TermWidthPreset | string;
  /**
   * Summary layout only: each row puts its term above its value instead of
   * beside it, at every width. For narrow cells (stat chips, sidebars) where
   * a term column would leave the value no room. `termWidth` is ignored.
   */
  stacked?: boolean;
  /**
   * Classes every row's term / value cell carries. They are merged ahead of
   * the item's own `labelClass` / `valueClass`, so a row can still override
   * a conflicting utility.
   */
  labelClass?: string;
  valueClass?: string;
  /**
   * Fallback placeholder for empty items in this list.
   * Can be a string, ReactNode, or a semantic preset ('dash' | 'none' | 'not-set' | 'optional' | 'na').
   * Defaults to 'dash' (—).
   */
  emptyPlaceholder?: PropertyPlaceholderValue;
  /**
   * Default policy for omitting empty items across this list.
   * If true, empty items are hidden. If false, empty items are kept and show their placeholder (dash).
   * Child items can override this with their own `hideIfEmpty`.
   */
  hideIfEmpty?: boolean;
  /**
   * Data-driven render via array of item specifications.
   */
  items?: PropertyItemProps[];
}

export interface BasePropertyItemProps {
  /** Override the enclosing list's variant for this item. */
  variant?: PropertyListVariant;
  id?: string;
  label?: ReactNode;
  colon?: boolean;
  /**
   * Maximum character length before a string label in `summary` mode is
   * wrapped in a `Tooltip` (`false` disables truncation tooltip). Defaults to
   * `20` in `summary` mode.
   */
  labelTooltipLen?: number | false;
  description?: ReactNode;
  children?: ReactNode;
  tooltip?: ReactNode;
  warnTooltip?: string;
  actions?: ReactNode;
  /**
   * Marks a row whose value cannot be changed right now. It does not dim or
   * block the `actions` slot: the controls there carry their own disabled
   * state, and their reason tooltip must stay hoverable.
   */
  disabled?: boolean;
  required?: boolean;
  /**
   * Omit the item when `value` (and `children`) is `undefined`, `null`, `''`,
   * or `false` (`0` is still rendered). Defaults to `true` in `summary` mode
   * and `false` in `divided` / `compact` mode.
   */
  hideIfEmpty?: boolean;
  /**
   * What an empty value shows when its row is not hidden, e.g. "Never" or
   * "Unlimited", or a preset ('dash' | 'none' | 'not-set' | 'optional' | 'na').
   * Supplying a custom placeholder automatically keeps the row visible in summary mode
   * (hideIfEmpty defaults to false). Never offered for copying.
   */
  placeholder?: PropertyPlaceholderValue;
  /** Truncate the value with an ellipsis when long, keeping any copy icon visible. */
  ellipsis?: boolean;
  /** Tooltip of the copy icon. Defaults to a translated "Copy to clipboard". */
  copyLabel?: string;
  /** Tooltip after copying. Defaults to a translated "Copied". */
  copiedLabel?: string;
  /** Fixed term column width preset or CSS string. */
  termWidth?: TermWidthPreset | string;
  /** Summary layout: bottom margin step (defaults to 1 -> `mb-1`). */
  space?: PropertySpace;
  /** Classes for the row itself. */
  className?: string;
  /** Classes for the term, after the list's `labelClass`. */
  labelClass?: string;
  /** Classes for the description under the term (`divided` only). */
  descriptionClass?: string;
  /** Classes for the value, after the list's `valueClass`. */
  valueClass?: string;
  /** Classes for the actions slot (`divided` only). */
  actionsClass?: string;
  'data-testid'?: string;
}

/**
 * Discriminated union for copyable protection at compile time:
 * - For primitives, Date, and propVal.* formatters, copyable?: boolean | string (or hasCopy) is allowed.
 * - For arbitrary ReactNode, boolean copyable is disallowed (requires an explicit string or copyValue).
 */
export type PropertyItemProps = BasePropertyItemProps &
  (
    | {
        value?: AutoCopyableValue | AutoCopyableValue[];
        copyable?: boolean | string;
        hasCopy?: boolean;
        copyValue?: string;
      }
    | {
        value?: ReactNode | ReactNode[];
        copyable?: string;
        hasCopy?: never;
        copyValue?: string;
      }
  );

export interface CopyableValueProps {
  /** The text copied. */
  value: string;
  /** What was copied, in words ("Fixed IP"), for the copy feedback. */
  name?: string;
  /** Tooltip of the copy icon. Defaults to a translated "Copy to clipboard". */
  label?: string;
  /** Tooltip after copying. Defaults to a translated "Copied". */
  copiedLabel?: string;
  /** Truncate the value with an ellipsis when long. */
  ellipsis?: boolean;
  /** What shows; defaults to `value`. */
  children?: ReactNode;
}

export interface PropertyCardProps {
  title?: ReactNode;
  className?: string;
  headerClassName?: string;
  /** Outline the card instead of relying on the theme shadow. */
  bordered?: boolean;
  refetch?(): void;
  /** Defaults to a translated "Refresh". */
  refreshLabel?: string;
  /** Defaults to a translated "Loading". */
  loadingLabel?: string;
  loading?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
}

export interface PropertyListSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}
