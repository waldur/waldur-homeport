import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatResourceType } from '../utils';

import { ActionItem } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface DestroyActionItemProps<T> {
  apiMethod(id: string): Promise<any>;
  resource: T;
  dialogSubtitle?: string;
  validators?: ActionValidator<T>[];
}

const getConfirmationText = (resource) => {
  const context = {
    name: resource.name.toUpperCase(),
    resourceType: formatResourceType(resource) || 'resource',
  };
  if (resource.state === 'Erred') {
    return translate(
      'Are you sure you want to delete a {name} {resourceType} in an Erred state? A cleanup attempt will be performed if you choose so. ',
      context,
    );
  } else {
    return translate(
      'Are you sure you want to delete a {name} {resourceType}? ',
      context,
    );
  }
};

export const DestroyActionItem: <T extends { uuid: string }>(
  props: DestroyActionItemProps<T>,
) => ReactElement = ({ resource, apiMethod, validators, dialogSubtitle }) => {
  const dispatch = useDispatch();
  const validationState = useValidators(validators, resource);
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Destroy resource'),
        getConfirmationText(resource) + (dialogSubtitle || ''),
      );
    } catch {
      return;
    }

    try {
      await apiMethod(resource.uuid);
      dispatch(showSuccess(translate('Resource deletion has been scheduled.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete resource.')));
    }
  };
  return (
    <ActionItem
      title={translate('Destroy')}
      action={callback}
      className="remove"
      {...validationState}
    />
  );
};
