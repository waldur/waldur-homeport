import { FORM_ERROR } from 'final-form';
import { useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  EmailInvitationRequest,
  proposalProtectedCallsInviteByEmail,
} from 'waldur-js-client';

import { StringField, SubmitButton, TextField } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { Call } from '../../types';

interface DirectEmailInviteDialogProps {
  resolve: {
    call: Call;
    refetch: () => void;
  };
}

interface FormValues {
  email: string;
  invitation_message?: string;
}

const required = (value) =>
  value ? undefined : translate('This field is required.');

const email = (value) =>
  value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? translate('Invalid email address.')
    : undefined;

const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined,
    );

export const DirectEmailInviteDialog = ({
  resolve,
}: DirectEmailInviteDialogProps) => {
  const dispatch = useDispatch();

  const processRequest = useCallback(
    async (values: FormValues) => {
      try {
        await proposalProtectedCallsInviteByEmail({
          path: { uuid: resolve.call.uuid },
          body: {
            email: values.email,
            invitation_message: values.invitation_message || undefined,
          } as EmailInvitationRequest,
        });
        resolve.refetch();
        dispatch(
          showSuccess(
            translate('Invitation sent to {email}.', { email: values.email }),
          ),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to send invitation.')));
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to send invitation.') };
      }
    },
    [resolve, dispatch],
  );

  return (
    <Form
      onSubmit={processRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Invite reviewer by email')}
            closeButton
            footer={
              <>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Send invitation')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <FormContainer submitting={submitting} className="size-lg">
              <FormGroup label={translate('Email address')} required>
                <Field
                  name="email"
                  component={StringField as any}
                  validate={composeValidators(required, email)}
                  placeholder={translate('reviewer@example.com')}
                />
              </FormGroup>

              <FormGroup label={translate('Invitation message')}>
                <Field
                  name="invitation_message"
                  component={TextField as any}
                  rows={4}
                  placeholder={translate(
                    'Optional custom message for the invitation email...',
                  )}
                />
                <div className="form-text text-muted">
                  {translate(
                    'This message will be included in the invitation email.',
                  )}
                </div>
              </FormGroup>
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
