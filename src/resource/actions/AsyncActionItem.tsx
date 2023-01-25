import { AxiosResponse } from 'axios';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ActionItem } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface AsyncActionItemProps<T> {
  apiMethod(id: string): Promise<AxiosResponse>;
  resource: T;
  validators: ActionValidator<T>[];
  title: string;
  icon?: string;
  iconClass?: string;
  className?: string;
  successMessage?: string;
  errorMessage?: string;
  refetch?(): void;
}

export const AsyncActionItem: <T extends { uuid: string; name?: string }>(
  props: AsyncActionItemProps<T>,
) => ReactElement = ({
  resource,
  apiMethod,
  validators,
  successMessage,
  errorMessage,
  refetch,
  ...rest
}) => {
  const validationState = useValidators(validators, resource);
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await apiMethod(resource.uuid);
      dispatch(
        showSuccess(
          successMessage ||
            translate('{action} has been scheduled for {resource}.', {
              action: rest.title || translate('Action'),
              resource: resource.name || resource.uuid,
            }),
        ),
      );
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          errorMessage || translate('Unable to apply action.'),
        ),
      );
    }
  };
  return <ActionItem {...rest} {...validationState} action={callback} />;
};
