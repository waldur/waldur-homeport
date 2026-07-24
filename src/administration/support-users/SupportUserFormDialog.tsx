import { PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  SupportUser,
  supportUsersCreate,
  supportUsersPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  CreatableSelectGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

// The helpdesks Waldur ships support for. Creatable, so a support user pulled
// from some other backend keeps its own value instead of being forced into one
// of these.
const HELPDESK_OPTIONS = ['atlassian', 'zammad', 'smax'].map((name) => ({
  label: name,
  value: name,
}));

interface UserOption {
  url: string;
  full_name?: string;
  username?: string;
}

interface HelpdeskOption {
  label: string;
  value: string;
}

interface FormValues {
  name: string;
  backend_id?: string;
  backend_name?: HelpdeskOption;
  user?: UserOption;
}

export const SupportUserFormDialog = ({ resolve }) => {
  const supportUser: SupportUser | undefined = resolve.supportUser;
  const isEdit = Boolean(supportUser?.uuid);

  const onSubmitMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) => {
      const body = {
        name: values.name,
        backend_id: values.backend_id || null,
        backend_name: values.backend_name?.value || null,
        user: values.user?.url ?? null,
      };
      // PATCH, not PUT: a full update drops every field the form does not
      // send, which would wipe the helpdesk link of the record being edited.
      return isEdit
        ? supportUsersPartialUpdate({
            path: { uuid: supportUser.uuid },
            body,
          })
        : supportUsersCreate({ body });
    },
    successMessage: isEdit
      ? translate('The support user has been updated.')
      : translate('The support user has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update support user.')
      : translate('Unable to create support user.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={
        supportUser
          ? {
              name: supportUser.name,
              backend_id: supportUser.backend_id ?? undefined,
              backend_name: supportUser.backend_name
                ? {
                    label: supportUser.backend_name,
                    value: supportUser.backend_name,
                  }
                : undefined,
              user: supportUser.user
                ? {
                    url: supportUser.user,
                    full_name: supportUser.user_full_name,
                  }
                : undefined,
            }
          : undefined
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={isEdit ? null : <PlusCircleIcon weight="bold" />}
            iconColor="success"
            title={
              isEdit
                ? translate('Edit {name}', { name: supportUser.name })
                : translate('Add support user')
            }
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Add')}
              />
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              required
              validate={required}
            />
            <CreatableSelectGroup
              name="backend_name"
              label={translate('Helpdesk')}
              placeholder={translate('Select or type a helpdesk...')}
              options={HELPDESK_OPTIONS}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              isClearable={true}
            />
            <StringGroup
              name="backend_id"
              label={translate('Backend ID')}
              description={translate(
                'Identifier of this user in the helpdesk. Changing it re-links the record to a different helpdesk user.',
              )}
            />
            <AsyncSelectGroup
              name="user"
              label={translate('Linked Waldur user')}
              placeholder={translate('Select user...')}
              defaultOptions={true}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.full_name || option.username}
              loadOptions={userAutocomplete}
              isClearable={true}
              noOptionsMessage={() => translate('No users found')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
