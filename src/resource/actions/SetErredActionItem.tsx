import { CloudXIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { marketplaceProviderResourcesSetAsErred } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { waitForConfirmation } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { getUser } from '@/workspace/selectors';

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

export const SetErredActionItem: FC<{
  resource;
  marketplaceResource;
  refetch;
}> = ({ resource, marketplaceResource, refetch }) => {
  // if the parent is OpenStack resource actionslist then we use marketplaceResource here, otherwise resource param is already marketplace resource object
  const resource_uuid = marketplaceResource
    ? marketplaceResource.uuid
    : resource.uuid;
  const customer_uuid = marketplaceResource
    ? marketplaceResource.provider_uuid
    : resource.provider_uuid;

  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_STATE,
      customerId: customer_uuid,
    }) ||
    !resource_uuid
  ) {
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
      await marketplaceProviderResourcesSetAsErred({
        path: { uuid: resource_uuid },
      });
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
      iconNode={<CloudXIcon weight="bold" />}
      iconColor="danger"
      actionId={ResourceAction.SET_AS_ERRED}
      resource={resource}
    />
  );
};
