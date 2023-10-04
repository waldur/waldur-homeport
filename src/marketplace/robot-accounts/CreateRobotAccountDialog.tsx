import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import {
  LATIN_NAME_PATTERN,
  returnReactSelectAsyncPaginateObject,
} from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createRobotAccount, getUsers } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
      getUsers({
        full_name: query,
        project_uuid: resource.project_uuid,
        field: ['full_name', 'email', 'url', 'uuid'],
        o: 'full_name',
        page,
        page_size: ENV.pageSize,
      }).then((response) =>
        returnReactSelectAsyncPaginateObject(response, prevOptions, page),
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

export const CreateRobotAccountDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
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
      submitForm={async (formData: RobotAccountFormData) => {
        const keys = formData.keys?.trim();
        try {
          await createRobotAccount({
            ...formData,
            resource: resource.url,
            users: formData.users?.map(({ url }) => url),
            responsible_user: formData.responsible_user.url,
            keys: keys ? keys.split(/\r?\n/) : [],
          });
          dispatch(showSuccess(translate('Robot account has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create robot account.')),
          );
        }
      }}
    />
  );
};
