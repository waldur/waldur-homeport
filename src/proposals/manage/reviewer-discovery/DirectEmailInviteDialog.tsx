import { FORM_ERROR } from 'final-form';
import { Form } from 'react-final-form';
import { proposalProtectedCallsInviteByEmail } from 'waldur-js-client';

import { composeValidators, email, required } from '@/core/validators';
import { SubmitButton, TextGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
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
              <StringGroup
                name="email"
                validate={composeValidators(required, email)}
                placeholder={translate('reviewer@example.com')}
                label={translate('Email address')}
                required
              />

              <TextGroup
                label={translate('Invitation message')}
                name="invitation_message"
                rows={4}
                placeholder={translate(
                  'Optional custom message for the invitation email...',
                )}
                description={translate(
                  'This message will be included in the invitation email.',
                )}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
