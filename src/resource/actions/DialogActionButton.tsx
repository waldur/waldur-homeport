import { ReactElement } from 'react';

import { ActionButton, RowActionButton } from '@waldur/table/ActionButton';

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
  rowAction,
  actionItem,
  ...rest
}) => {
  const validationState = useValidators(validators, resource);
  const callback = useModalDialogCallback(
    modalComponent,
    dialogSize,
    resource,
    formId,
    extraResolve,
  );
  if (rowAction) {
    return <RowActionButton {...rest} {...validationState} action={callback} />;
  } else if (actionItem) {
    return <ActionItem {...rest} {...validationState} action={callback} />;
  } else {
    return <ActionButton {...rest} {...validationState} action={callback} />;
  }
};
