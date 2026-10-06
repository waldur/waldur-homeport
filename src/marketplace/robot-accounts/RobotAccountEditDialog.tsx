import { useQuery } from '@tanstack/react-query';
import {
  marketplaceProviderResourcesRetrieve,
  marketplaceRobotAccountsPartialUpdate,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

import {
  isUsernameManagedByProvider,
  RobotAccountFormData,
  useRobotAccountFields,
} from './CreateRobotAccountDialog';

const RobotAccountEditForm = ({ resource, refetch, marketplaceResource }) => {
  const fields = useRobotAccountFields({
    resourceUuid: resource.resource_uuid,
    usernameManagedByProvider: isUsernameManagedByProvider(marketplaceResource),
  });
  return (
    <UpdateResourceDialog
      fields={fields}
      resource={resource}
      initialValues={{
        type: resource.type,
        username: resource.username,
        users: resource.users,
        keys: resource.keys ? resource.keys.join('\n') : [],
        responsible_user: resource.responsible_user,
      }}
      updateResource={(id, formData: RobotAccountFormData) =>
        marketplaceRobotAccountsPartialUpdate({
          path: { uuid: id },
          body: {
            ...formData,
            keys: formData.keys ? formData.keys.trim().split(/\r?\n/) : [],
            users: formData.users?.map(({ url }) => url),
            responsible_user: formData.responsible_user?.url || '',
          },
        })
      }
      verboseName={translate('robot account')}
      refetch={refetch}
    />
  );
};

// `resource` here is the robot account row. It carries only the offering's own
// plugin options, not the effective account settings a service provider policy
// is inherited through, so load those from the marketplace resource it belongs
// to — otherwise a username the provider manages would be editable here.
export const RobotAccountEditDialog = ({ resolve: { resource, refetch } }) => {
  const { data, isError } = useQuery({
    queryKey: ['RobotAccountEditDialog', resource.resource_uuid],
    queryFn: () =>
      marketplaceProviderResourcesRetrieve({
        path: { uuid: resource.resource_uuid },
        query: {
          field: ['offering_account_settings', 'offering_plugin_options'],
        },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });

  if (data) {
    return (
      <RobotAccountEditForm
        resource={resource}
        refetch={refetch}
        marketplaceResource={data}
      />
    );
  }
  return (
    <ModalDialog
      title={translate('Update {resourceType}', {
        resourceType: translate('robot account'),
      })}
    >
      {isError ? (
        <h3>{translate('Unable to load settings.')}</h3>
      ) : (
        <LoadingSpinner />
      )}
    </ModalDialog>
  );
};
