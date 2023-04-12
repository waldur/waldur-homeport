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

export const CreateRobotAccountDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  const loadUsers = useCallback(
    (query, prevOptions, page) =>
      getUsers({
        name: query,
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
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create robot account for marketplace resource')}
      formFields={[
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
        },
        {
          name: 'users',
          label: translate('Users'),
          type: 'async_select',
          loadOptions: loadUsers,
          getOptionLabel: ({ full_name, email }) => `${full_name} (${email})`,
          getOptionValue: ({ uuid }) => uuid,
          required: true,
          isMulti: true,
        },
        {
          name: 'keys',
          label: translate('SSH public keys'),
          type: 'text',
        },
      ]}
      initialValues={{
        type: 'cicd',
      }}
      submitForm={async (formData) => {
        try {
          await createRobotAccount({
            ...formData,
            resource: resource.url,
            users: formData.users?.map(({ url }) => url),
            keys: formData.keys?.split(/\r?\n/),
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
