import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useEffect, useId, useRef } from 'react';

import { ButtonVariant, Tooltip, BaseButton, Menu } from 'waldur-ui';

import { StaffOnlyIndicator } from '@/customer/details/StaffOnlyIndicator';
import { translate } from '@/i18n';
import { useActionCombobox } from '@/marketplace/resources/actions/ActionComboboxContext';
import {
  isActionVisible,
  useActionListFilter,
} from '@/marketplace/resources/actions/ActionList';
import { ResourceAction } from '@/marketplace/resources/actions/constants';

/** The colours an action's icon can take (default gray). */
export type ActionIconColor =
  'gray-400' | 'danger' | 'success' | 'warning' | 'info';

// What Metronic's svg-icon-<colour> classes drew, in both themes (measured
// in the app): the icon's paths take the span's colour (fill=currentColor).
const ICON_COLOR_CLASSNAMES: Record<ActionIconColor, string> = {
  'gray-400':
    'text-[var(--color-gray-400)] dark:text-[var(--color-gray-dark-500)]',
  danger: 'text-[var(--color-error-600)] dark:text-[var(--color-error-400)]',
  success:
    'text-[var(--color-success-600)] dark:text-[var(--color-success-400)]',
  warning:
    'text-[var(--color-warning-600)] dark:text-[var(--color-warning-400)]',
  info: 'text-[var(--color-purple-600)] dark:text-[var(--color-purple-300)]',
};

// Bootstrap's text-dark, in both themes.
const STAFF_ICON_CLASSNAME =
  'ms-1 me-3 text-[var(--color-gray-900)] dark:text-[var(--color-gray-dark-50)]';

export interface ActionItemProps {
  title: string;
  label?: string;
  action: () => void;
  iconNode?: ReactNode;
  iconColor?: ActionIconColor;
  staff?: boolean;
  important?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  as?;
  size?: 'sm' | 'lg';
  actionId?: ResourceAction;
  resource?: any;
  variant?: ButtonVariant;
}

export const ActionItem: FC<ActionItemProps> = (props) => {
  const filter = useActionListFilter();
  const combobox = useActionCombobox();
  const descriptionId = useId();
  const itemId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = props.label ?? props.title ?? '';

  const isVisible = isActionVisible(filter, {
    label,
    disabled: props.disabled,
    important: props.important,
    actionId: props.actionId,
    resource: props.resource,
  });

  const registerItem = combobox?.registerItem;

  useEffect(() => {
    if (!registerItem || !isVisible) return;
    return registerItem({
      id: itemId,
      label,
      disabled: props.disabled,
      action: props.action,
      element: buttonRef.current,
    });
  }, [registerItem, isVisible, itemId, label, props.disabled, props.action]);

  const itemIndex = combobox
    ? combobox.items.findIndex((it) => it.id === itemId)
    : -1;
  const isHighlighted =
    combobox && itemIndex >= 0 && combobox.highlightedIndex === itemIndex;

  useEffect(() => {
    if (isHighlighted && buttonRef.current) {
      buttonRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isHighlighted]);

  if (!isVisible) {
    return null;
  }

  // `as` renders the action as a button outside a menu.
  if (props.as && props.as !== Menu.Item) {
    return (
      <div className="flex items-center">
        <BaseButton
          className={props.className}
          onClick={props.action}
          disabled={props.disabled}
          iconNode={props.iconNode}
          label={label}
          tooltip={props.tooltip}
          variant={props.variant ?? 'tertiary'}
          size={props.size ?? 'lg'}
        />
        {props.staff && <StaffOnlyIndicator className={STAFF_ICON_CLASSNAME} />}
      </div>
    );
  }

  // The reason an action is disabled and the staff-only marker are shown
  // beside the row, as icons with tooltips (a disabled row takes no pointer
  // events, so a tooltip on it would never open). A screen reader gets the
  // same through aria-describedby.
  const description = [props.tooltip, props.staff && translate('Staff action')]
    .filter(Boolean)
    .join('. ');

  const comboboxItemProps =
    combobox && itemIndex >= 0
      ? combobox.getItemProps({
          item: combobox.items[itemIndex],
          index: itemIndex,
          ref: buttonRef,
        })
      : undefined;

  const trailing =
    props.tooltip || props.staff ? (
      <span className="inline-flex items-center shrink-0 pointer-events-auto">
        {props.tooltip && (
          <Tooltip label={props.tooltip}>
            <QuestionIcon
              size={20}
              weight="bold"
              aria-hidden="true"
              className={classNames(
                'ms-1 me-3 text-[var(--menu-item-muted-text)]',
                props.disabled && 'opacity-50',
              )}
            />
          </Tooltip>
        )}
        {props.staff && <StaffOnlyIndicator className={STAFF_ICON_CLASSNAME} />}
      </span>
    ) : undefined;

  return (
    <>
      <Menu.Item
        {...comboboxItemProps}
        ref={(node: any) => {
          buttonRef.current = node;
          if (typeof comboboxItemProps?.ref === 'function') {
            comboboxItemProps.ref(node);
          } else if (
            comboboxItemProps?.ref &&
            'current' in comboboxItemProps.ref
          ) {
            (comboboxItemProps.ref as any).current = node;
          }
        }}
        icon={
          props.iconNode ? (
            <span
              className={classNames(
                'leading-none [&>svg]:size-[20px]',
                ICON_COLOR_CLASSNAMES[props.iconColor ?? 'gray-400'],
                // This span sets its own colour, so the row's disabled
                // colour never reaches the icon. Fade it like the label.
                props.disabled && 'opacity-50',
              )}
            >
              {props.iconNode}
            </span>
          ) : undefined
        }
        trailing={trailing}
        className={classNames(isHighlighted && 'active', props.className)}
        data-highlighted={isHighlighted ? '' : undefined}
        aria-describedby={description ? descriptionId : undefined}
        // onSelect, not onClick: it covers keyboard activation (Enter/Space)
        // as well as pointer, and closes the menu afterwards. `disabled`
        // blocks selection.
        onSelect={() => props.action()}
        disabled={props.disabled}
      >
        <span
          className={props.disabled ? 'opacity-50' : undefined}
          data-testid="action-item-content"
        >
          {label}
        </span>
      </Menu.Item>
      {description && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
    </>
  );
};
