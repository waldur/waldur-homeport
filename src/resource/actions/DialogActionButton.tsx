import { ReactElement } from 'react';

import { ActionButton } from '@waldur/table/ActionButton';

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
  return <ActionButton {...rest} {...validationState} action={callback} />;
};
