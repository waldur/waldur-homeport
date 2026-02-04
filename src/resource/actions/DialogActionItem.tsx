import { ReactElement } from 'react';

import { ActionItem } from './ActionItem';
import { DialogActionProps } from './DialogActionProps';
import { useModalDialogCallback } from './useModalDialogCallback';
import { useValidators } from './useValidators';

export const DialogActionItem: <T>(
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
    resource,
    extraResolve,
    { size: dialogSize, formId },
  );
  return (
    <ActionItem
      {...rest}
      {...validationState}
      resource={resource}
      action={callback}
    />
  );
};
