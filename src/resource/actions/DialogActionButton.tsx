import { ReactElement } from 'react';

import { BaseButton } from 'waldur-ui';

import { ActionItem } from './ActionItem';
import { DialogActionProps } from './DialogActionProps';
import { useModalDialogCallback } from './useModalDialogCallback';
import { useValidators } from './useValidators';

export const DialogActionButton: <T>(
  props: DialogActionProps<T>,
) => ReactElement = ({
  modalComponent,
  dialogSize,
  resource,
  formId,
  validators,
  extraResolve,
  actionItem,
  ...rawRest
}) => {
  // Neither ActionItem nor ActionButton (below) declares `icon`/`iconClass`
  // — without stripping them here they'd fall into `rest` and get spread
  // all the way down to a real DOM <button> via BaseButton's ...rest
  // passthrough.
  const { icon: _icon, iconClass: _iconClass, ...rest } = rawRest;
  const validationState = useValidators(validators, resource);
  const callback = useModalDialogCallback(
    modalComponent,
    resource,
    extraResolve,
    { size: dialogSize, formId },
  );
  if (actionItem) {
    return <ActionItem {...rest} {...validationState} action={callback} />;
  }
  // ActionButton's own interface has no staff/important/size/iconColor/
  // actionId (unlike ActionItem, which supports all five) — forwarding them
  // here would both leak invalid DOM attributes onto BaseButton's rendered
  // <button> and let a passed `size` silently override ActionButton's own
  // hardcoded `size="lg"` (its whole contract: "Always renders at large
  // size for visual consistency").
  const {
    staff: _staff,
    important: _important,
    size: _size,
    iconColor: _iconColor,
    actionId: _actionId,
    title,
    label,
    variant,
    ...actionButtonProps
  } = rest;
  return (
    <BaseButton
      {...actionButtonProps}
      {...validationState}
      label={label ?? title}
      onClick={callback}
      variant={variant ?? 'tertiary'}
      size="lg"
    />
  );
};
