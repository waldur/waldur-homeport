import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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
} from 'waldur-js-client';

import { url } from '@/core/validators';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { ServiceProvider } from '../types';

const STATE_TRANSITIONS = {
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

const getAvailableStateOptions = (currentState: string) => {
  const allOptions = [
    { label: 'OK', value: 'OK' },
    { label: 'Creating', value: 'Creating' },
    { label: 'Pending account linking', value: 'Pending account linking' },
    {
      label: 'Pending additional validation',
      value: 'Pending additional validation',
    },
    { label: 'Error creating', value: 'Error creating' },
    { label: 'Error deleting', value: 'Error deleting' },
    { label: 'Deleted', value: 'Deleted' },
    { label: 'Deleting', value: 'Deleting' },
    { label: 'Requested deletion', value: 'Requested deletion' },
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

const UPDATE_FIELDS = (currentState?: string) => ({
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
              { label: 'OK', value: 'OK' },
              {
                label: 'Creating',
                value: 'Creating',
              },
              {
                label: 'Pending account linking',
                value: 'Pending account linking',
              },
              {
                label: 'Pending additional validation',
                value: 'Pending additional validation',
              },
              {
                label: 'Error creating',
                value: 'Error creating',
              },
              {
                label: 'Error deleting',
                value: 'Error deleting',
              },
              {
                label: 'Deleted',
                value: 'Deleted',
              },
              {
                label: 'Deleting',
                value: 'Deleting',
              },
              {
                label: 'Requested deletion',
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
  const dispatch = useDispatch();

  const currentState = row.state;
  const updateFields = UPDATE_FIELDS(currentState);
  const fields = updateFields[updateScope]?.fields || [];

  const submit = useCallback(
    async (formData) => {
      try {
        if (updateScope === 'username') {
          // Username
          await marketplaceOfferingUsersPartialUpdate({
            path: { uuid: row.uuid },
            body: {
              username: formData.username,
            },
          });
          dispatch(showSuccess(translate('Username has been updated.')));
        } else if (updateScope === 'comment') {
          // Comment
          await marketplaceOfferingUsersUpdateCommentsPartialUpdate({
            path: { uuid: row.uuid },
            body: {
              service_provider_comment: formData.service_provider_comment || '',
              service_provider_comment_url:
                formData.service_provider_comment_url || '',
            },
          });
          dispatch(showSuccess(translate('Comment has been updated.')));
        } else if (updateScope === 'state') {
          // Update state
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
          await api({ path: { uuid: row.uuid } });
          dispatch(showSuccess(translate('Account state has been updated.')));
        }
        dispatch(closeModalDialog());
        if (refetch) {
          await refetch();
        }
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to update offering user.')),
        );
      }
    },
    [row, updateScope, refetch, dispatch],
  );

  return (
    <ResourceActionDialog
      dialogTitle={updateFields[updateScope]?.title || DASH_ESCAPE_CODE}
      formFields={fields}
      initialValues={fields.reduce((acc, field) => {
        acc[field.name] = row[field.name];
        return acc;
      }, {})}
      submitForm={submit}
    />
  );
};
