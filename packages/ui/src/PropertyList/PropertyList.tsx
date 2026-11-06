import { Children, FC, isValidElement, PropsWithChildren, useId } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { CopyButton } from '../CopyButton';
import { FieldScope, useFieldLabelFor } from '../Form';

import { PropertyListContext, usePropertyListContext } from './context';
import {
  DASH,
  hasContent,
  ItemDescription,
  itemRawValue,
  resolveEffectiveVariant,
  resolvePropertyValue,
  resolveTermWidth,
  TermLabel,
  Tips,
  ValueWithCopy,
} from './internals';
import { PropertyCard } from './PropertyCard';
import { SPACE_CLASSES } from './scales';
import {
  type CopyableValueProps,
  type PropertyCardProps,
  type PropertyItemProps,
  type PropertyListProps,
  type PropertyListSectionProps,
  type PropertyListVariant,
} from './types';

const PropertyItemBody: FC<PropertyItemProps> = (allProps) => {
  const {
    actions,
    copyValue,
    copyLabel = allProps.copyLabel ?? translate('Copy to clipboard'),
    copiedLabel = translate('Copied'),
    ...props
  } = allProps;
  const ctx = usePropertyListContext();
  const space = allProps.space ?? ctx.space ?? 1;
  const effectiveVariant = resolveEffectiveVariant(allProps, ctx);
  const effectiveTermWidth =
    resolveTermWidth(allProps.termWidth) ??
    ctx.termWidth ??
    (effectiveVariant === 'summary' ? resolveTermWidth('md') : undefined);
  const termId = useId();
  const controlId = useFieldLabelFor();
  const rawValue = itemRawValue(allProps);
  const effectivePlaceholder = props.placeholder ?? ctx.emptyPlaceholder;

  // Support both RFC `copyable` and Waldur's `hasCopy` / `copyValue`
  const explicitCopyText =
    typeof allProps.copyable === 'string' ? allProps.copyable : copyValue;
  const copyEnabled =
    allProps.copyable !== undefined
      ? Boolean(allProps.copyable)
      : Boolean(allProps.hasCopy || explicitCopyText);

  const isArray = Array.isArray(rawValue);
  const valueItems = isArray
    ? rawValue.length === 0
      ? [null]
      : rawValue
    : [rawValue];

  // When rendered outside a `<PropertyList>`, wrap in `<dl>` so `<dt>` and
  // `<dd>` are always valid HTML descendants of a description list.
  const RowTag = ctx.insideList ? 'div' : 'dl';
  // One identity for the row, whichever variant renders it.
  const rowProps = {
    id: props.id,
    'data-slot': 'property-item',
    'data-testid': props['data-testid'] ?? props.id,
    // A row whose value cannot be changed right now: a hook for styling and
    // tests, while the controls in `actions` carry their own disabled state.
    'data-disabled': props.disabled || undefined,
  };
  const hasActions = hasContent(actions);
  const showActions = !ctx.hideActions && hasActions;
  const hasTerm = hasContent(props.label) || hasContent(props.description);
  // Only associate `<dd>` via `aria-labelledby` when there is no inline form
  // control in the row; when a control is mounted, `<label htmlFor>` already
  // names the control and `aria-labelledby` on `<dd>` would double-label it.
  const ddLabelledBy =
    !controlId && hasContent(props.label) ? termId : undefined;
  const hasEllipsis = Boolean(
    props.ellipsis ||
    ctx.ellipsis ||
    /ellipsis|truncate/.test(
      [ctx.valueClass, props.valueClass].filter(Boolean).join(' '),
    ),
  );
  const copyName = typeof props.label === 'string' ? props.label : undefined;

  if (effectiveVariant === 'compact') {
    return (
      <RowTag
        {...rowProps}
        className={cn(
          'm-0 flex items-baseline justify-between gap-4 py-1 text-sm',
          props.className,
        )}
      >
        {hasTerm && (
          <dt
            data-slot="property-term"
            className={cn(
              'm-0 font-normal text-quaternary',
              ctx.labelClass,
              props.labelClass,
            )}
          >
            <span className="inline-flex items-center">
              <TermLabel
                termId={termId}
                controlId={controlId}
                label={props.label}
                required={props.required}
                colon={props.colon}
              />
              <Tips
                tooltip={props.tooltip}
                warnTooltip={props.warnTooltip}
                size={16}
              />
            </span>
          </dt>
        )}
        {valueItems.map((val, i) => {
          const { itemShown, itemEffectiveCopyValue } = resolvePropertyValue(
            val,
            i,
            explicitCopyText,
            copyEnabled,
            effectivePlaceholder,
          );

          return (
            <dd
              key={i}
              data-slot="property-value"
              aria-labelledby={ddLabelledBy}
              className={cn(
                'm-0 text-end font-medium text-primary wrap-break-word',
                i > 0 && 'ms-auto',
                props.disabled && 'text-quaternary',
                ctx.valueClass,
                props.valueClass,
              )}
            >
              {itemShown}
              {itemEffectiveCopyValue && (
                <CopyButton
                  value={itemEffectiveCopyValue}
                  name={copyName}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                  iconOnly
                  className="ms-1.5"
                />
              )}
            </dd>
          );
        })}
      </RowTag>
    );
  }

  if (effectiveVariant === 'summary') {
    const showColon =
      props.colon !== undefined ? props.colon : typeof props.label === 'string';
    const tooltipLen =
      props.labelTooltipLen !== undefined ? props.labelTooltipLen : 20;

    return (
      <RowTag
        {...rowProps}
        style={{
          ...(effectiveTermWidth &&
          !ctx.stacked &&
          (!ctx.insideList || allProps.termWidth || !ctx.termWidth)
            ? ({ '--dt-width': effectiveTermWidth } as React.CSSProperties)
            : {}),
        }}
        className={cn(
          ctx.stacked
            ? // Term above value at every width: no term track to squeeze
              // the value in a narrow cell.
              'field-row flex flex-col m-0'
            : 'field-row flex flex-wrap m-0 sm:grid sm:grid-cols-[var(--dt-width)_minmax(0,1fr)] sm:gap-6 items-baseline',
          space ? SPACE_CLASSES[space] : undefined,
          props.className,
        )}
      >
        {hasTerm && (
          <dt
            data-slot="property-term"
            className={cn(
              'w-full text-secondary font-medium break-words field-label m-0',
              !ctx.stacked && 'sm:w-auto',
              ctx.labelClass,
              props.labelClass,
            )}
          >
            <TermLabel
              termId={termId}
              controlId={controlId}
              className="mb-0"
              label={props.label}
              required={props.required}
              colon={showColon}
              tooltipLen={tooltipLen}
            />
          </dt>
        )}
        {valueItems.map((val, i) => {
          const { itemShown, itemEffectiveCopyValue } = resolvePropertyValue(
            val,
            i,
            explicitCopyText,
            copyEnabled,
            effectivePlaceholder,
          );

          return (
            <dd
              key={i}
              data-slot="property-value"
              aria-labelledby={ddLabelledBy}
              className={cn(
                'w-full m-0 text-quaternary [&_p]:m-0',
                !ctx.stacked && 'sm:w-auto',
                i > 0 && !ctx.stacked && 'sm:col-start-2',
                !hasEllipsis && 'wrap-break-word',
                hasEllipsis && 'min-w-0 overflow-hidden',
                ctx.valueClass,
                props.valueClass,
              )}
            >
              <ValueWithCopy
                copyValue={itemEffectiveCopyValue}
                name={copyName}
                label={copyLabel}
                copiedLabel={copiedLabel}
                ellipsis={hasEllipsis}
              >
                {itemShown}
                {i === 0 && (
                  <Tips
                    tooltip={props.tooltip}
                    warnTooltip={props.warnTooltip}
                    size={16}
                    className="ms-1"
                  />
                )}
              </ValueWithCopy>
            </dd>
          );
        })}
      </RowTag>
    );
  }

  // Default: `divided` variant (property sheet)
  return (
    <RowTag
      {...rowProps}
      className={cn(
        'm-0 col-span-full grid grid-cols-1 sm:grid-cols-subgrid gap-x-6 gap-y-1 py-4 min-h-[52px] border-b border-secondary last:border-b-0',
        ctx.alignTop ? 'items-start' : 'items-center',
        props.className,
      )}
    >
      {hasTerm && (
        <dt
          data-slot="property-term"
          className={cn(
            'm-0 min-w-0 font-medium text-secondary leading-5',
            ctx.labelClass,
            props.labelClass,
          )}
        >
          {hasContent(props.label) && (
            <div className="flex items-center">
              <TermLabel
                termId={termId}
                controlId={controlId}
                className="mb-0"
                label={props.label}
                required={props.required}
                colon={props.colon}
              />
              <Tips
                tooltip={props.tooltip}
                warnTooltip={props.warnTooltip}
                size={20}
              />
            </div>
          )}
          {hasContent(props.description) && (
            <ItemDescription
              className={cn(
                'font-normal text-quaternary line-clamp-2',
                props.descriptionClass,
              )}
            >
              {props.description}
            </ItemDescription>
          )}
        </dt>
      )}
      {valueItems.map((val, i) => {
        const { itemShown, itemEffectiveCopyValue } = resolvePropertyValue(
          val,
          i,
          explicitCopyText,
          copyEnabled,
          effectivePlaceholder,
        );

        return (
          <dd
            key={i}
            data-slot="property-value"
            aria-labelledby={ddLabelledBy}
            className={cn(
              'm-0 min-w-0',
              i > 0
                ? 'sm:col-start-2'
                : hasTerm
                  ? ctx.hideActions
                    ? 'sm:col-start-2'
                    : 'sm:col-start-2 sm:col-span-2 flex items-center justify-between gap-4 sm:grid sm:grid-cols-subgrid'
                  : 'col-span-full',
              ctx.alignTop ? 'items-start' : 'items-center',
            )}
          >
            <div
              className={cn(
                'min-w-0 leading-5',
                !hasEllipsis && 'wrap-break-word',
                hasEllipsis && 'overflow-hidden',
                ctx.detailsMode || props.disabled
                  ? 'text-quaternary font-normal'
                  : 'text-tertiary',
                !showActions && !ctx.hideActions && hasTerm && 'sm:col-span-2',
                ctx.valueClass,
                props.valueClass,
              )}
            >
              <ValueWithCopy
                copyValue={itemEffectiveCopyValue}
                name={copyName}
                label={copyLabel}
                copiedLabel={copiedLabel}
                ellipsis={hasEllipsis}
              >
                {/* A property sheet shows every property, so an empty
                    value reads as a dash rather than a blank cell. */}
                {itemShown}
              </ValueWithCopy>
            </div>
            {i === 0 && hasActions && (
              <div
                data-slot="property-actions"
                hidden={ctx.hideActions || undefined}
                className={cn(
                  'inline-flex items-center justify-end gap-1.5 whitespace-nowrap justify-self-end text-end',
                  ctx.hideActions && 'hidden',
                  props.actionsClass,
                )}
              >
                {actions}
              </div>
            )}
          </dd>
        );
      })}
    </RowTag>
  );
};

/**
 * A value with the copy icon a `hasCopy` row draws, for the cases a row cannot
 * carry it: several copyable values in one row (each copies itself), or a
 * value shown other than it copies (a masked secret). `children` is what
 * shows, `value` alone otherwise.
 */
export const CopyableValue: FC<CopyableValueProps> = ({
  value,
  name,
  label = translate('Copy to clipboard'),
  copiedLabel = translate('Copied'),
  ellipsis,
  children,
}) => (
  <ValueWithCopy
    copyValue={value}
    name={name}
    label={label}
    copiedLabel={copiedLabel}
    ellipsis={ellipsis}
  >
    {children ?? value}
  </ValueWithCopy>
);

export const PropertyItem: FC<PropertyItemProps> = (props) => {
  const ctx = usePropertyListContext();
  const effectiveVariant = resolveEffectiveVariant(props, ctx);
  const rawValue = itemRawValue(props);

  const effectivePlaceholder = props.placeholder ?? ctx.emptyPlaceholder;
  const hasCustomPlaceholder =
    effectivePlaceholder !== undefined &&
    effectivePlaceholder !== 'dash' &&
    effectivePlaceholder !== DASH;

  const isValueEmpty = Array.isArray(rawValue)
    ? rawValue.length === 0 || rawValue.every((item) => !hasContent(item))
    : !hasContent(rawValue);

  const shouldHideEmpty =
    props.hideIfEmpty ??
    ctx.hideIfEmpty ??
    (!hasCustomPlaceholder && effectiveVariant === 'summary');

  if (shouldHideEmpty && isValueEmpty) {
    return null;
  }

  return (
    <FieldScope>
      <PropertyItemBody {...props} />
    </FieldScope>
  );
};

const listVariantClasses = (
  variant: PropertyListVariant,
  resolvedTermWidth?: string,
  hideActions?: boolean,
) =>
  cn(
    variant === 'divided' && [
      'grid grid-cols-1',
      resolvedTermWidth
        ? hideActions
          ? 'sm:grid-cols-[var(--dt-width)_1fr]'
          : 'sm:grid-cols-[var(--dt-width)_1fr_auto]'
        : hideActions
          ? 'sm:grid-cols-[minmax(140px,max-content)_1fr] sm:[&:has(>div>dt>[data-slot=property-description])]:grid-cols-[minmax(150px,33.333%)_1fr] md:grid-cols-[minmax(190px,max-content)_1fr] md:[&:has(>div>dt>[data-slot=property-description])]:grid-cols-[minmax(200px,33.333%)_1fr]'
          : 'sm:grid-cols-[minmax(150px,25%)_1fr_auto] sm:[&:has(>div>dt>[data-slot=property-description])]:grid-cols-[minmax(150px,33.333%)_1fr_auto] md:grid-cols-[minmax(200px,25%)_1fr_auto] md:[&:has(>div>dt>[data-slot=property-description])]:grid-cols-[minmax(200px,33.333%)_1fr_auto]',
    ],
    // `summary` rows lay out their own label/value widths (CSS grid with
    // `--dt-width`), so the list is a plain block.
    variant === 'compact' && 'flex flex-col gap-1',
  );

export const PropertyList: FC<PropsWithChildren<PropertyListProps>> & {
  Item: FC<PropertyItemProps>;
  Card: FC<PropertyCardProps>;
  Section: FC<PropsWithChildren<PropertyListSectionProps>>;
} = ({
  variant = 'divided',
  detailsMode,
  alignTop,
  hideActions,
  space,
  termWidth,
  stacked,
  labelClass,
  valueClass,
  emptyPlaceholder,
  hideIfEmpty,
  className,
  items,
  children,
  as,
  ...props
}) => {
  const resolvedTermWidth =
    resolveTermWidth(termWidth) ??
    (variant === 'summary' ? resolveTermWidth('md') : undefined);
  const hasSectionChild = Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      (child.type === PropertyListSection ||
        (child.type as { displayName?: string })?.displayName ===
          'PropertyListSection'),
  );
  const Component = (as ?? (hasSectionChild ? 'div' : 'dl')) as 'dl';

  return (
    <PropertyListContext.Provider
      value={{
        insideList: true,
        variant,
        detailsMode,
        alignTop,
        hideActions,
        ellipsis: props.ellipsis,
        space,
        termWidth: resolvedTermWidth,
        stacked,
        labelClass,
        valueClass,
        emptyPlaceholder,
        hideIfEmpty,
      }}
    >
      <Component
        data-slot="property-list"
        data-testid={props['data-testid'] ?? 'property-list'}
        data-hide-actions={hideActions ? 'true' : undefined}
        style={{
          ...(resolvedTermWidth
            ? ({ '--dt-width': resolvedTermWidth } as React.CSSProperties)
            : {}),
          ...props.style,
        }}
        className={cn(
          'm-0 w-full text-sm',
          hasSectionChild
            ? !className?.includes('grid') && 'flex flex-col gap-6'
            : listVariantClasses(variant, resolvedTermWidth, hideActions),
          className,
        )}
        {...props}
      >
        {items &&
          items.map((item, index) => (
            // eslint-disable-next-line waldur-custom/property-item-in-list
            <PropertyItem
              key={
                item.id ?? (typeof item.label === 'string' ? item.label : index)
              }
              {...item}
            />
          ))}
        {children}
      </Component>
    </PropertyListContext.Provider>
  );
};

export const PropertyListSection: FC<
  PropsWithChildren<PropertyListSectionProps>
> = ({ title, description, actions, className, children, ...props }) => {
  const ctx = usePropertyListContext();
  const variant = ctx.variant ?? 'divided';
  const resolvedTermWidth = ctx.termWidth;
  const hideActions = ctx.hideActions;

  return (
    <section
      data-slot="property-list-section"
      className={cn('w-full', className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-secondary">
          <div>
            {title && (
              <h6 className="text-secondary font-medium text-sm m-0">
                {title}
              </h6>
            )}
            {description && (
              <p className="text-quaternary text-xs mt-0.5 mb-0">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <dl
        data-slot="property-list-section-dl"
        className={cn(
          'm-0 w-full text-sm',
          listVariantClasses(variant, resolvedTermWidth, hideActions),
        )}
      >
        {children}
      </dl>
    </section>
  );
};
PropertyListSection.displayName = 'PropertyListSection';

PropertyList.Item = PropertyItem;
PropertyList.Card = PropertyCard;
PropertyList.Section = PropertyListSection;

export * from './types';
export { usePropertyListContext } from './context';
export { PropertyCard } from './PropertyCard';
