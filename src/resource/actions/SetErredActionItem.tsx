import { CloudX } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { formatResourceType } from '../utils';

import { ActionItem } from './ActionItem';

const getConfirmationText = (resource) => {
  const context = {
    name: resource.name.toUpperCase(),
    resourceType: formatResourceType(resource) || 'resource',
  };
  return translate(
    'Are you sure you want to set {name} {resourceType} to erred state? ',
    context,
  );
};

export const SetErredActionItem: FC<{ resource; refetch }> = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user.is_staff || !resource.marketplace_resource_uuid) {
    return null;
  }
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Set as erred'),
        getConfirmationText(resource),
      );
    } catch {
      return;
    }

    try {
      await post(
        `/marketplace-resources/${resource.marketplace_resource_uuid}/set_as_erred/`,
      );
      refetch();
      dispatch(showSuccess(translate('Resource has been set as erred.')));
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to set resource to erred state.'),
        ),
      );
    }
  };
  return (
    <ActionItem
      title={translate('Set as erred')}
      action={callback}
      className="text-danger"
      staff
      iconNode={<CloudX />}
    />
  );
};
