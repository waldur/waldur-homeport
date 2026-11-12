import { FC, ReactNode, useEffect, useId, useRef } from 'react';

import {
  BaseButton,
  ButtonVariant,
  Menu,
  MenuActionIconColor,
  MenuActionItem,
} from 'waldur-ui';

import { StaffOnlyIndicator } from '@/customer/details/StaffOnlyIndicator';
import { translate } from '@/i18n';
import { useActionCombobox } from '@/marketplace/resources/actions/ActionComboboxContext';
import {
  isActionVisible,
  useActionListFilter,
} from '@/marketplace/resources/actions/ActionList';
import { ResourceAction } from '@/marketplace/resources/actions/constants';

/** The colours an action's icon can take (default gray). */
export type ActionIconColor = MenuActionIconColor;

// Primary text color, in both themes.
const STAFF_ICON_CLASSNAME = 'ms-1 me-2.5 text-primary';

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

  const comboboxItemProps =
    combobox && itemIndex >= 0
      ? combobox.getItemProps({
          item: combobox.items[itemIndex],
          index: itemIndex,
          ref: buttonRef,
        })
      : undefined;

  return (
    <MenuActionItem
      itemProps={comboboxItemProps}
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
      label={label}
      action={props.action}
      iconNode={props.iconNode}
      iconColor={props.iconColor}
      disabled={props.disabled}
      tooltip={props.tooltip}
      marker={
        props.staff && <StaffOnlyIndicator className={STAFF_ICON_CLASSNAME} />
      }
      markerDescription={props.staff ? translate('Staff action') : undefined}
      className={props.className}
      highlighted={isHighlighted}
    />
  );
};
