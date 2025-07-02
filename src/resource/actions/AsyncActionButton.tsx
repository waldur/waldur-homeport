import { ReactElement, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface AsyncActionButtonProps<T> {
  apiMethod(id: string): Promise<any>;
  resource: T;
  validators?: ActionValidator<T>[];
  title: string;
  actionTitle?: string;
  icon?: string;
  iconNode?: ReactNode;
  className?: string;
  hasConfirmation?: boolean;
  refetch?(): void;
}

export const AsyncActionButton: <T extends { uuid?: string }>(
  props: AsyncActionButtonProps<T>,
) => ReactElement = ({
  resource,
  apiMethod,
  validators,
  refetch,
  hasConfirmation,
  actionTitle,
  ...rest
}) => {
  const validationState = useValidators(validators, resource);
  const dispatch = useDispatch();
  const callback = async () => {
    if (hasConfirmation) {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to {action}?', {
            action: (actionTitle || rest.title).toLowerCase(),
          }),
          {
            iconNode: rest.iconNode,
            type: 'success',
          },
        );
      } catch {
        return;
      }
    }
    try {
      await apiMethod(resource.uuid);
      if (refetch) {
        refetch();
      }
      dispatch(showSuccess(translate('Action has been applied.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to apply action.')));
    }
  };
  return <ActionButton {...rest} {...validationState} action={callback} />;
};
