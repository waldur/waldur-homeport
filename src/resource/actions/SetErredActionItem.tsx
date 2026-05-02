import { CloudXIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceProviderResourcesSetAsErred } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

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
  const user = useUser();

  // if the parent is OpenStack resource actionslist then we use marketplaceResource here, otherwise resource param is already marketplace resource object
  const resource_uuid = marketplaceResource
    ? marketplaceResource.uuid
    : resource.uuid;

  const customer_uuid = marketplaceResource
    ? marketplaceResource.provider_uuid
    : resource.provider_uuid;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderResourcesSetAsErred({
        path: { uuid: resource_uuid },
      }),
    confirmation: {
      title: translate('Set as erred'),
      body: getConfirmationText(resource),
    },
    successMessage: translate('Resource has been set as erred.'),
    errorMessage: translate('Unable to set resource to erred state.'),
    refetch,
  });

  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_STATE,
      customerId: customer_uuid,
    }) ||
    !resource_uuid
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Set as erred')}
      action={mutate}
      disabled={isPending}
      className="text-danger"
      iconNode={<CloudXIcon weight="bold" />}
      iconColor="danger"
      actionId={ResourceAction.SET_AS_ERRED}
      resource={resource}
    />
  );
};
