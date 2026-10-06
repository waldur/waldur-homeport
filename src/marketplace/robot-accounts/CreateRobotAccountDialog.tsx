import { useMemo } from 'react';
import {
  marketplaceProviderResourcesRobotAccountUsersList,
  marketplaceRobotAccountsCreate,
} from 'waldur-js-client';

import { LATIN_NAME_PATTERN } from '@/core/utils';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

export interface RobotAccountFormData {
  type: string;
  username: string;
  users: Array<{ url: string; full_name: string; email: string }>;
  keys: string;
  responsible_user: { url: string; full_name: string; email: string };
}

// Locking the username needs the offering's effective account settings, which
// only the marketplace resource carries: the policy may be inherited from the
// service provider, so the offering's own plugin option is just a fallback for
// an older API.
export const isUsernameManagedByProvider = (resource: {
  offering_account_settings?: {
    username_generation_policy?: { value?: string };
  };
  offering_plugin_options?: { username_generation_policy?: string };
}) =>
  (resource.offering_account_settings?.username_generation_policy?.value ??
    resource.offering_plugin_options?.username_generation_policy) ===
  'service_provider';

// `resourceUuid` is the marketplace resource the robot account belongs to. The
// backend lists only the users such an account may link, so people who have
// not accepted the offering's Terms of Service are never offered.
export const useRobotAccountFields = ({
  resourceUuid,
  usernameManagedByProvider,
}: {
  resourceUuid: string;
  usernameManagedByProvider: boolean;
}) => {
  const loadUsers = useMemo(
    () =>
      createLoadOptions(
        marketplaceProviderResourcesRobotAccountUsersList,
        // Matches full name, username or email, not just the name.
        'user_keyword',
        {},
        { uuid: resourceUuid },
      ),
    [resourceUuid],
  );

  return [
    {
      name: 'type',
      label: translate('Type'),
      maxlength: 5,
      required: true,
      type: 'string',
    },
    {
      name: 'username',
      label: translate('Username'),
      maxlength: 32,
      type: 'string',
      pattern: LATIN_NAME_PATTERN,
      disabled: usernameManagedByProvider,
      disabled_tooltip: translate('Username is managed by service provider.'),
    },
    {
      name: 'users',
      label: translate('Users'),
      type: 'async_select',
      loadOptions: loadUsers,
      getOptionLabel: ({ full_name, email }) => `${full_name} (${email})`,
      getOptionValue: ({ uuid }) => uuid,
      required: false,
      isMulti: true,
    },
    {
      name: 'responsible_user',
      label: translate('Responsible user'),
      type: 'async_select',
      loadOptions: loadUsers,
      getOptionLabel: ({ full_name, email }) => `${full_name} (${email})`,
      getOptionValue: ({ uuid }) => uuid,
      required: false,
      isMulti: false,
      isClearable: true,
    },
    {
      name: 'keys',
      label: translate('SSH public keys'),
      type: 'text',
    },
  ];
};

export const CreateRobotAccountDialog = ({
  resolve: { resource, refetch },
}: {
  resolve: { resource: any; refetch?: () => void };
}) => {
  const mutation = useManagedMutation<any, any, RobotAccountFormData>({
    mutationFn: (formData) =>
      marketplaceRobotAccountsCreate({
        body: {
          ...formData,
          resource: resource.url,
          users: formData.users?.map(({ url }) => url),
          responsible_user: formData.responsible_user?.url,
          keys: formData.keys ? formData.keys.split(/\r?\n/) : [],
        },
      }),

    successMessage: translate('Robot account has been created.'),
    errorMessage: translate('Unable to create robot account.'),
    refetch: refetch,
  });

  const fields = useRobotAccountFields({
    resourceUuid: resource.uuid,
    usernameManagedByProvider: isUsernameManagedByProvider(resource),
  });
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create robot account')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
      formFields={fields}
      initialValues={{
        type: 'cicd',
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
