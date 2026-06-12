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
  marketplaceOfferingUsersUpdateCommentsPartialUpdate,
  OfferingUser,
  OfferingUserState,
  ServiceProvider,
} from 'waldur-js-client';

import { url } from '@/core/validators';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { DASH_ESCAPE_CODE } from '@/table/constants';

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

export interface ProviderOfferingUserUpdateDialogProps {
  resolve: {
    row: OfferingUser;
    refetch(): void;
    provider: ServiceProvider;
    updateScope: 'username' | 'comment' | 'state';
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
        component: MarkdownEditor,
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
});

export const ProviderOfferingUserUpdateDialog: FC<
  ProviderOfferingUserUpdateDialogProps
> = ({ resolve: { row, refetch, updateScope = 'username' } }) => {
  const currentState = row.state;
  const updateFields = UPDATE_FIELDS(currentState);
  const fields = updateFields[updateScope]?.fields || [];

  const mutation = useManagedMutation<
    any,
    any,
    {
      username?: string;
      service_provider_comment?: string;
      service_provider_comment_url?: string;
      state?: string;
    }
  >({
    mutationFn: (formData) => {
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
      }
    },
    successMessage:
      updateScope === 'username'
        ? translate('Username has been updated.')
        : updateScope === 'comment'
          ? translate('Comment has been updated.')
          : translate('Account state has been updated.'),
    errorMessage: translate('Unable to update offering user.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={updateFields[updateScope]?.title || DASH_ESCAPE_CODE}
      formFields={fields}
      initialValues={fields.reduce((acc, field) => {
        acc[field.name] = row[field.name];
        return acc;
      }, {})}
      submitForm={mutation.mutateAsync}
    />
  );
};
