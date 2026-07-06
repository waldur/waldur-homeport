import { FC } from 'react';
import {
  marketplaceOfferingUsersBeginCreating,
  marketplaceOfferingUsersPartialUpdate,
  marketplaceOfferingUsersRequestDeletion,
  marketplaceOfferingUsersSetDeleted,
  marketplaceOfferingUsersSetDeleting,
  marketplaceOfferingUsersSetErrorCreating,
  marketplaceOfferingUsersSetErrorDeleting,
  marketplaceOfferingUsersSetOk,
  marketplaceOfferingUsersSetPendingAccountLinking,
  marketplaceOfferingUsersSetPendingAdditionalValidation,
  marketplaceOfferingUsersSetPosixAttributes,
  marketplaceOfferingUsersUpdateCommentsPartialUpdate,
  marketplaceOfferingUsersUpdateRuntimeState,
  OfferingUser,
  OfferingUserState,
  RuntimeStateEnum,
  ServiceProvider,
} from 'waldur-js-client';

import { url } from '@/core/validators';
import { MarkdownGroup } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { useNotify } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';

// POSIX UID/GID bounds. Below 1000 is reserved for system accounts;
// 2^32-1 is the reserved (id_t) -1 value.
const POSIX_MIN_ID = 1000;
const POSIX_MAX_ID = 2 ** 32 - 2;
const POSIX_ID_FIELD_DESCRIPTION = translate(
  'Must be at least 1000 (lower values are reserved for system accounts). The value must fall within the offering’s POSIX ID pool and is rejected if already allocated.',
);

const STATE_TRANSITIONS: Record<OfferingUserState, OfferingUserState[]> = {
  Requested: ['Creating', 'OK', 'Error creating'],
  Creating: [
    'OK',
    'Pending additional validation',
    'Pending account linking',
    'Error creating',
  ],
  'Pending additional validation': [
    'OK',
    'Error creating',
    'Pending account linking',
  ],
  'Pending account linking': [
    'OK',
    'Error creating',
    'Pending additional validation',
  ],
  OK: ['Requested deletion'],
  'Error creating': [
    'Creating',
    'OK',
    'Pending additional validation',
    'Pending account linking',
  ],
  'Error deleting': ['OK', 'Deleting'],
  'Requested deletion': ['Deleting', 'Error deleting'],
  Deleting: ['Deleted', 'Error deleting'],
  Deleted: [],
};

const getAvailableStateOptions = (currentState: OfferingUserState) => {
  const allOptions: { label: string; value: OfferingUserState }[] = [
    { label: translate('OK'), value: 'OK' },
    { label: translate('Creating'), value: 'Creating' },
    {
      label: translate('Pending account linking'),
      value: 'Pending account linking',
    },
    {
      label: translate('Pending additional validation'),
      value: 'Pending additional validation',
    },
    { label: translate('Error creating'), value: 'Error creating' },
    { label: translate('Error deleting'), value: 'Error deleting' },
    { label: translate('Deleted'), value: 'Deleted' },
    { label: translate('Deleting'), value: 'Deleting' },
    { label: translate('Requested deletion'), value: 'Requested deletion' },
  ];

  const availableStates = STATE_TRANSITIONS[currentState] || [];

  return allOptions.filter((option) => availableStates.includes(option.value));
};

const RUNTIME_STATE_OPTIONS: { label: string; value: RuntimeStateEnum }[] = [
  { label: translate('Active'), value: 'Active' },
  {
    label: translate('Pending account linking'),
    value: 'Pending account linking',
  },
  {
    label: translate('Pending additional validation'),
    value: 'Pending additional validation',
  },
];

export interface ProviderOfferingUserUpdateDialogProps {
  resolve: {
    row: OfferingUser;
    refetch(): void;
    provider: ServiceProvider;
    updateScope: 'username' | 'comment' | 'state' | 'runtime_state' | 'posix';
  };
}

const UPDATE_FIELDS = (currentState?: OfferingUserState) => ({
  username: {
    title: translate('Set external username'),
    fields: [
      {
        name: 'username',
        type: 'string',
        required: true,
        label: translate('External username'),
      },
    ],
  },
  comment: {
    title: translate('Set comment'),
    fields: [
      {
        name: 'service_provider_comment',
        component: MarkdownGroup,
        label: translate('Comment'),
        placeholder: translate('Your comment...'),
      },
      {
        name: 'service_provider_comment_url',
        type: 'string',
        label: translate('Comment URL'),
        placeholder: translate('e.g. https://example.com/comment/123'),
        validate: url,
      },
    ],
  },
  state: {
    title: translate('Set account state'),
    fields: [
      {
        name: 'state',
        type: 'select',
        label: translate('Account state'),
        options: currentState
          ? getAvailableStateOptions(currentState)
          : [
              { label: translate('OK'), value: 'OK' },
              {
                label: translate('Creating'),
                value: 'Creating',
              },
              {
                label: translate('Pending account linking'),
                value: 'Pending account linking',
              },
              {
                label: translate('Pending additional validation'),
                value: 'Pending additional validation',
              },
              {
                label: translate('Error creating'),
                value: 'Error creating',
              },
              {
                label: translate('Error deleting'),
                value: 'Error deleting',
              },
              {
                label: translate('Deleted'),
                value: 'Deleted',
              },
              {
                label: translate('Deleting'),
                value: 'Deleting',
              },
              {
                label: translate('Requested deletion'),
                value: 'Requested deletion',
              },
            ],
      },
    ],
  },
  runtime_state: {
    title: translate('Set runtime state'),
    fields: [
      {
        name: 'runtime_state',
        type: 'select',
        label: translate('Runtime state'),
        options: RUNTIME_STATE_OPTIONS,
        required: true,
      },
    ],
  },
  posix: {
    title: translate('Edit POSIX attributes'),
    fields: [
      {
        name: 'login_shell',
        type: 'string',
        label: translate('Login shell'),
        placeholder: '/bin/bash',
      },
      {
        name: 'home_directory',
        type: 'string',
        label: translate('Home directory'),
        placeholder: '/home/username',
      },
      {
        name: 'uidnumber',
        type: 'integer',
        label: translate('UID'),
        minValue: POSIX_MIN_ID,
        maxValue: POSIX_MAX_ID,
        description: POSIX_ID_FIELD_DESCRIPTION,
      },
      {
        name: 'primarygroup',
        type: 'integer',
        label: translate('Primary GID'),
        minValue: POSIX_MIN_ID,
        maxValue: POSIX_MAX_ID,
        description: POSIX_ID_FIELD_DESCRIPTION,
      },
    ],
  },
});

export const ProviderOfferingUserUpdateDialog: FC<
  ProviderOfferingUserUpdateDialogProps
> = ({ resolve: { row, refetch, updateScope = 'username' } }) => {
  const currentState = row.state;
  const updateFields = UPDATE_FIELDS(currentState);
  const fields = updateFields[updateScope]?.fields || [];
  const { showInfo } = useNotify();

  const mutation = useManagedMutation<
    any,
    any,
    {
      username?: string;
      service_provider_comment?: string;
      service_provider_comment_url?: string;
      state?: string;
      runtime_state?: RuntimeStateEnum;
      login_shell?: string;
      home_directory?: string;
      uidnumber?: number | string;
      primarygroup?: number | string;
    }
  >({
    mutationFn: async (formData) => {
      if (updateScope === 'username') {
        return marketplaceOfferingUsersPartialUpdate({
          path: { uuid: row.uuid },
          body: {
            username: formData.username,
          },
        });
      } else if (updateScope === 'comment') {
        return marketplaceOfferingUsersUpdateCommentsPartialUpdate({
          path: { uuid: row.uuid },
          body: {
            service_provider_comment: formData.service_provider_comment || '',
            service_provider_comment_url:
              formData.service_provider_comment_url || '',
          },
        });
      } else if (updateScope === 'state') {
        let api;
        switch (formData.state) {
          case 'OK':
            api = marketplaceOfferingUsersSetOk;
            break;
          case 'Creating':
            api = marketplaceOfferingUsersBeginCreating;
            break;
          case 'Pending account linking':
            api = marketplaceOfferingUsersSetPendingAccountLinking;
            break;
          case 'Pending additional validation':
            api = marketplaceOfferingUsersSetPendingAdditionalValidation;
            break;
          case 'Error creating':
            api = marketplaceOfferingUsersSetErrorCreating;
            break;
          case 'Error deleting':
            api = marketplaceOfferingUsersSetErrorDeleting;
            break;
          case 'Deleted':
            api = marketplaceOfferingUsersSetDeleted;
            break;
          case 'Deleting':
            api = marketplaceOfferingUsersSetDeleting;
            break;
          case 'Requested deletion':
            api = marketplaceOfferingUsersRequestDeletion;
            break;
        }
        return api({ path: { uuid: row.uuid } });
      } else if (updateScope === 'runtime_state') {
        return marketplaceOfferingUsersUpdateRuntimeState({
          path: { uuid: row.uuid },
          body: {
            runtime_state: formData.runtime_state,
          },
        });
      } else if (updateScope === 'posix') {
        // Only send a UID/GID when it actually changed: the fields are
        // pre-filled, and re-submitting an unchanged value would needlessly
        // re-issue the identity and re-emit its warning.
        const changedId = (value, current?: number) =>
          value !== '' && value != null && Number(value) !== current;
        const response = await marketplaceOfferingUsersSetPosixAttributes({
          path: { uuid: row.uuid },
          body: {
            login_shell: formData.login_shell,
            home_directory: formData.home_directory,
            ...(changedId(formData.uidnumber, row.uidnumber)
              ? { uidnumber: Number(formData.uidnumber) }
              : {}),
            ...(changedId(formData.primarygroup, row.primarygroup)
              ? { primarygroup: Number(formData.primarygroup) }
              : {}),
          },
        });
        (response.data?.warnings || []).forEach((warning) => showInfo(warning));
        return response;
      }
    },
    successMessage:
      updateScope === 'username'
        ? translate('Username has been updated.')
        : updateScope === 'comment'
          ? translate('Comment has been updated.')
          : updateScope === 'runtime_state'
            ? translate('Runtime state has been updated.')
            : updateScope === 'posix'
              ? translate('POSIX attributes have been updated.')
              : translate('Account state has been updated.'),
    errorMessage: translate('Unable to update offering user.'),
    refetch,
  });

  const baseTitle = updateFields[updateScope]?.title || DASH_ESCAPE_CODE;
  const accountLabel = row.username || row.user_username;
  const dialogTitle =
    updateScope === 'posix' && accountLabel
      ? `${baseTitle} · ${accountLabel}`
      : baseTitle;

  return (
    <ResourceActionDialog
      dialogTitle={dialogTitle}
      formFields={fields}
      initialValues={fields.reduce((acc, field) => {
        acc[field.name] =
          field.name === 'runtime_state'
            ? row.runtime_state || 'Active'
            : row[field.name];
        return acc;
      }, {})}
      submitForm={mutation.mutateAsync}
    />
  );
};
