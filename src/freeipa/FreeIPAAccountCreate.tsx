import { PlusIcon } from '@phosphor-icons/react';
import React from 'react';
import { FormGroup } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { freeipaProfilesCreate } from 'waldur-js-client';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { UsernameGroup } from './UsernameGroup';

interface FreeIPAAccountCreateFormData {
  username: string;
}

interface FreeIPAAccountCreateOwnProps {
  onProfileAdded(): void;
}

const SUGGESTED_USERNAME_PATTERN = /[^a-zA-Z0-9._-]/g;

const fixUsername = (username: string): string =>
  username.replace(SUGGESTED_USERNAME_PATTERN, '_');

export const FreeIPAAccountCreate: React.FC<FreeIPAAccountCreateOwnProps> = ({
  onProfileAdded,
}) => {
  const { showError } = useNotify();
  const user = useUser();

  const { mutateAsync: submitMutation } = useManagedMutation<
    any,
    any,
    FreeIPAAccountCreateFormData
  >({
    mutationFn: (formData) =>
      freeipaProfilesCreate({ body: { username: formData.username } }),
    successMessage: translate('A profile has been created.'),
    errorMessage: translate('Unable to create a FreeIPA profile.'),
    onSuccess: onProfileAdded,
    onError: (response: any) => {
      if (response.data && response.data.username) {
        showError(response.data.username);
      }
    },
    closeModal: false,
  });

  return (
    <Form<FreeIPAAccountCreateFormData>
      onSubmit={async (formData) => {
        try {
          await submitMutation(formData);
        } catch {
          // Error is handled by onError in useManagedMutation
        }
      }}
      initialValues={{ username: fixUsername(user.username) }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <UsernameGroup />
          <FormGroup>
            <div className="pull-right">
              <SubmitButton
                submitting={submitting}
                disabled={invalid}
                className="btn btn-primary"
              >
                <span className="svg-icon svg-icon-2">
                  <PlusIcon weight="bold" />
                </span>{' '}
                {translate('Create')}
              </SubmitButton>
            </div>
          </FormGroup>
        </form>
      )}
    />
  );
};
