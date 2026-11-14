import { FC, PropsWithChildren, ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { CopyButton } from '../CopyButton';
import { useDescriptionId } from '../Form';
import { HelpIcon } from '../HelpIcon';
import { Tooltip } from '../Tooltip';
import { WarningTip } from '../WarningTip';

import type {
  PlaceholderPreset,
  PropertyItemProps,
  PropertyListContextValue,
  PropertyListVariant,
  PropertyPlaceholderValue,
  TermWidthPreset,
} from './types';
import { isFormattedProperty } from './types';

export const hasContent = (content: unknown): boolean => {
  if (
    content === undefined ||
    content === null ||
    content === '' ||
    content === false
  ) {
    return false;
  }
  if (typeof content === 'number' && Number.isNaN(content)) {
    return false;
  }
  if (Array.isArray(content) && content.length === 0) {
    return false;
  }
  return true;
};

// What `renderFieldOrDash` shows for a missing value; never worth copying.
export const DASH = '—';

/**
 * A placeholder's visible text, plus what a screen reader says instead when
 * the glyph means nothing read aloud ("—", "N/A"). `aria-label` cannot do it:
 * ARIA prohibits it on a `<span>` with no role, so it is ignored.
 */
const PlaceholderText: FC<{ label: ReactNode; srText?: string }> = ({
  label,
  srText,
}) => (
  <span
    data-slot="property-placeholder"
    className="text-quaternary font-normal select-none"
  >
    {srText ? (
      <>
        <span aria-hidden="true">{label}</span>
        <span className="sr-only">{srText}</span>
      </>
    ) : (
      label
    )}
  </span>
);

export const DashNode: FC = () => (
  <PlaceholderText label={DASH} srText={translate('Not specified')} />
);

export const DASH_NODE = <DashNode />;

export const isPlaceholderPreset = (
  value: unknown,
): value is PlaceholderPreset =>
  typeof value === 'string' &&
  ['dash', 'none', 'not-set', 'optional', 'na'].includes(value);

export const getPlaceholderPreset = (
  preset: PlaceholderPreset,
): { label: string; srText?: string } => {
  switch (preset) {
    case 'dash':
      return { label: DASH, srText: translate('Not specified') };
    case 'none':
      return { label: translate('None') };
    case 'not-set':
      return { label: translate('Not set') };
    case 'optional':
      return { label: translate('Optional') };
    case 'na':
      return { label: 'N/A', srText: translate('Not applicable') };
  }
};

export const renderPropertyPlaceholder = (
  placeholder?: PropertyPlaceholderValue,
): ReactNode => {
  if (isPlaceholderPreset(placeholder)) {
    const { label, srText } = getPlaceholderPreset(placeholder);
    return <PlaceholderText label={label} srText={srText} />;
  }

  if (placeholder === undefined || placeholder === null) {
    return <DashNode />;
  }

  if (typeof placeholder === 'string' || typeof placeholder === 'number') {
    return <PlaceholderText label={placeholder} />;
  }

  return (
    <span data-slot="property-placeholder" className="select-none">
      {placeholder}
    </span>
  );
};

/** The text a value can hand to the clipboard, if any. */
const copyableText = (value: unknown): string | undefined => {
  if (isFormattedProperty(value)) {
    return value.text && value.text.trim() !== DASH ? value.text : undefined;
  }
  return (typeof value === 'string' || typeof value === 'number') &&
    String(value).trim() !== DASH
    ? String(value)
    : undefined;
};

export interface ResolvedPropertyValue {
  itemShown: ReactNode;
  itemEffectiveCopyValue?: string;
  isEmpty: boolean;
}

export const resolvePropertyValue = (
  val: unknown,
  index: number,
  explicitCopyText?: string,
  copyEnabled?: boolean,
  effectivePlaceholder?: PropertyPlaceholderValue,
): ResolvedPropertyValue => {
  const itemFormatted = isFormattedProperty(val);
  const itemDisplay = itemFormatted ? val.node : (val as ReactNode);
  const itemEmpty = !hasContent(val);
  const itemPlaceholder = itemEmpty
    ? renderPropertyPlaceholder(effectivePlaceholder)
    : null;
  const itemShown = itemEmpty ? itemPlaceholder : itemDisplay;
  const itemCopyCandidate = itemEmpty
    ? undefined
    : explicitCopyText && index === 0
      ? explicitCopyText
      : copyEnabled
        ? copyableText(val)
        : undefined;
  const itemEffectiveCopyValue =
    itemCopyCandidate && itemCopyCandidate.trim() !== DASH
      ? itemCopyCandidate
      : undefined;

  return { itemShown, itemEffectiveCopyValue, isEmpty: itemEmpty };
};

export const TERM_WIDTH_PRESETS: Record<TermWidthPreset, string> = {
  sm: '10rem', // 160px
  md: '12.5rem', // 200px
  lg: '15rem', // 240px
  xl: '18rem', // 288px
};

export const resolveTermWidth = (
  width?: TermWidthPreset | string,
): string | undefined => {
  if (!width) return undefined;
  return TERM_WIDTH_PRESETS[width as TermWidthPreset] ?? width;
};

/** The value a row renders: `value`, or `children` when it has no value. */
export const itemRawValue = (props: PropertyItemProps): unknown =>
  hasContent(props.value)
    ? props.value
    : props.children !== undefined
      ? props.children
      : props.value;

const DIVIDED_PROPS = [
  'actions',
  'description',
  'required',
  'disabled',
] as const;

/**
 * Outside a `<PropertyList>`, an item is `divided` when its call site passes
 * any of `DIVIDED_PROPS`, else `summary`. It checks whether the prop is
 * written, not its value, so `actions={canEdit ? <Edit /> : undefined}` keeps
 * the same variant whichever way `canEdit` goes.
 */
export const resolveEffectiveVariant = (
  props: PropertyItemProps,
  ctx: PropertyListContextValue,
): PropertyListVariant => {
  if (props.variant) return props.variant;
  if (ctx.insideList) return ctx.variant;
  return DIVIDED_PROPS.some((name) => name in props) ? 'divided' : 'summary';
};

/**
 * Renders `<label htmlFor={target}>` only when a form control is mounted and
 * registered inside the enclosing `FieldScope`; otherwise renders a `<span>`
 * so read-only and modal-editable rows never emit orphan `<label>` elements.
 */
const ItemLabel: FC<
  PropsWithChildren<{ id?: string; htmlFor?: string; className?: string }>
> = ({ id, htmlFor, className, children }) =>
  htmlFor ? (
    <label id={id} htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <span id={id} className={className}>
      {children}
    </span>
  );

/**
 * Description line under the term; registers its id with `FieldScope` so any
 * form control in the row automatically points at it via `aria-describedby`.
 * It is clamped to two lines, so the tooltip carries the full text.
 */
export const ItemDescription: FC<
  PropsWithChildren<{ className?: string; tooltip?: boolean }>
> = ({ className, tooltip = true, children }) => {
  const id = useDescriptionId();
  const description = (
    <div id={id} data-slot="property-description" className={className}>
      {children}
    </div>
  );
  return tooltip ? (
    <Tooltip label={children}>{description}</Tooltip>
  ) : (
    description
  );
};

/**
 * A value with its copy icon pinned to the far end of the value cell, where
 * every copyable row puts it, so the icons line up down a list.
 */
export const ValueWithCopy: FC<
  PropsWithChildren<{
    copyValue?: string;
    name?: string;
    label: string;
    copiedLabel: string;
    ellipsis?: boolean;
    className?: string;
  }>
> = ({ copyValue, name, label, copiedLabel, ellipsis, className, children }) =>
  copyValue ? (
    <span
      className={cn(
        ellipsis
          ? 'flex items-center justify-between gap-2 min-w-0 w-full'
          : 'flex items-start justify-between gap-2',
        className,
      )}
    >
      <span className={cn('min-w-0', ellipsis && 'flex-1 truncate')}>
        {children}
      </span>
      <CopyButton
        value={copyValue}
        name={name}
        label={label}
        copiedLabel={copiedLabel}
        iconOnly
        className="-my-1.5 shrink-0"
      />
    </span>
  ) : ellipsis ? (
    <span className={cn('min-w-0 truncate block', className)}>{children}</span>
  ) : (
    <>{children}</>
  );

/** A row's required marker, in the one place every variant takes it from. */
const RequiredMark = () => <span className="ms-1 text-danger">*</span>;

/**
 * The text of a `<dt>`: the label, its required marker and its colon, named
 * for the row's control when one is mounted. A long `summary` label carries
 * its own tooltip, since that column is narrow.
 */
export const TermLabel: FC<{
  termId: string;
  controlId?: string;
  className?: string;
  label: ReactNode;
  required?: boolean;
  colon?: boolean;
  /** Characters a string label may reach before it gets a tooltip. */
  tooltipLen?: number | false;
}> = ({ termId, controlId, className, label, required, colon, tooltipLen }) => {
  const text = (
    <>
      {label}
      {required && <RequiredMark />}
      {colon ? ':' : ''}
    </>
  );
  return (
    <ItemLabel id={termId} htmlFor={controlId} className={className}>
      {typeof label === 'string' && tooltipLen && label.length > tooltipLen ? (
        <Tooltip label={label}>
          <span>{text}</span>
        </Tooltip>
      ) : (
        text
      )}
    </ItemLabel>
  );
};

/** The help and warning icons a term or value carries, at the variant's size. */
export const Tips: FC<{
  tooltip?: ReactNode;
  warnTooltip?: string;
  size: number;
  className?: string;
}> = ({ tooltip, warnTooltip, size, className = 'ms-1.5' }) => (
  <>
    {tooltip && <HelpIcon label={tooltip} size={size} className={className} />}
    {warnTooltip && (
      <WarningTip label={warnTooltip} size={size} className={className} />
    )}
  </>
);

export type { PropertyListVariant, PropertyListContextValue };
