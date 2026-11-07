import { FORM_ERROR } from 'final-form';
import { Form } from 'react-final-form';
import { proposalProtectedCallsInviteByEmail } from 'waldur-js-client';

import { composeValidators, email, required } from '@/core/validators';
import { NumberGroup, SubmitButton, TextGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
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
  max_assignments?: number;
}

// The backend's default workload limit for a new pool member.
const DEFAULT_MAX_ASSIGNMENTS = 5;

// Left empty, the backend applies its default.
const atLeastOne = (value?: number | string | null) =>
  value !== undefined && value !== null && value !== '' && Number(value) < 1
    ? translate('Must be at least 1.')
    : undefined;

const INITIAL_VALUES: Partial<FormValues> = {
  max_assignments: DEFAULT_MAX_ASSIGNMENTS,
};

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
          max_assignments: values.max_assignments
            ? Number(values.max_assignments)
            : undefined,
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
      initialValues={INITIAL_VALUES}
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
            subtitle={
              <ScopeSubtitle
                label={translate('Call name')}
                name={resolve.call.name}
              />
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Send invitation')}
                />
              </>
            }
          >
            <div>
              <StringGroup
                name="email"
                validate={composeValidators(required, email)}
                placeholder={translate('reviewer@example.com')}
                label={translate('Email address')}
                required
              />

              <NumberGroup
                name="max_assignments"
                min={1}
                validate={atLeastOne}
                label={translate('Maximum assignments')}
                description={translate(
                  'The maximum number of proposals that can be assigned to this reviewer. It can be changed in the Reviewer capacity tab once they accept.',
                )}
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
