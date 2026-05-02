import { useCallback } from 'react';
import { marketplaceRobotAccountsCreate, usersList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import {
  LATIN_NAME_PATTERN,
  returnReactSelectAsyncPaginateObject,
} from '@/core/utils';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

export interface RobotAccountFormData {
  type: string;
  username: string;
  users: Array<{ url: string; full_name: string; email: string }>;
  keys: string;
  responsible_user: { url: string; full_name: string; email: string };
}

export const useRobotAccountFields = (resource) => {
  const loadUsers = useCallback(
    (query, prevOptions, page) =>
      usersList({
        query: {
          full_name: query,
          project_uuid: resource.project_uuid,
          field: ['full_name', 'email', 'url', 'uuid'],
          o: ['full_name'],
          page,
          page_size: ENV.pageSize,
        },
      }).then((response) =>
        returnReactSelectAsyncPaginateObject(
          parseSelectData(response),
          prevOptions,
          page,
        ),
      ),
    [resource],
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
      disabled:
        resource.offering_plugin_options &&
        resource.offering_plugin_options['username_generation_policy'] ===
          'service_provider',
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

  const fields = useRobotAccountFields(resource);
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create robot account for {resource_name}', {
        resource_name: resource.name,
      })}
      formFields={fields}
      initialValues={{
        type: 'cicd',
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
