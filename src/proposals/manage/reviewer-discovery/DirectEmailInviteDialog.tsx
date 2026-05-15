import { FORM_ERROR } from 'final-form';
import { Field, Form } from 'react-final-form';
import { proposalProtectedCallsInviteByEmail } from 'waldur-js-client';

import { composeValidators, email, required } from '@/core/validators';
import { StringField, SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

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

export const DirectEmailInviteDialog = ({
  resolve,
}: DirectEmailInviteDialogProps) => {
  const { showSuccess } = useNotify();

  const inviteMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      proposalProtectedCallsInviteByEmail({
        path: { uuid: resolve.call.uuid },
        body: {
          email: values.email,
          invitation_message: values.invitation_message || undefined,
        },
      }),
    errorMessage: translate('Unable to send invitation.'),
    refetch: resolve.refetch,
    onSuccess: (_, variables) => {
      showSuccess(
        translate('Invitation sent to {email}.', { email: variables.email }),
      );
    },
  });

  return (
    <Form
      onSubmit={async (values: FormValues) => {
        try {
          await inviteMutation.mutateAsync(values);
        } catch (e) {
          if (e.response && e.response.status === 400) {
            return { [FORM_ERROR]: e.response.data };
          }
          return { [FORM_ERROR]: translate('Unable to send invitation.') };
        }
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Invite reviewer by email')}
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
            <div className="size-lg">
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
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
