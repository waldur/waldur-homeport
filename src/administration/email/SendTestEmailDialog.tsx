import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';

import { AlertItem } from '@/core/AlertItem';
import { required } from '@/core/validators';
import { EmailGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { getUser } from '@/workspace/selectors';

import { sendTestEmail } from './api';
import { getRequestErrorMessage } from './utils';

export const SendTestEmailDialog: FC = () => {
  const user = useSelector(getUser);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: sendTestEmail,
    // A delivered message writes an email log row, which is what the page's
    // "messages sent in the last week" counter reports.
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ['EmailDiagnostics'] });
      }
    },
  });
  const result = mutation.data;

  return (
    <Form
      initialValues={{ email: user?.email }}
      onSubmit={(values: any) => mutation.mutate(values.email)}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Send test email')}
            iconNode={<PaperPlaneTiltIcon weight="bold" />}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid || mutation.isPending}
                  submitting={mutation.isPending}
                  label={translate('Send')}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <p className="text-muted">
              {translate(
                'The message goes through the same code path as a real notification, so it fails in the same way a real notification would.',
              )}
            </p>
            <EmailGroup
              name="email"
              label={translate('Recipient')}
              validate={required}
              required
            />
            {mutation.isError && (
              <AlertItem
                variant="error"
                title={translate('The message could not be sent')}
                body={getRequestErrorMessage(mutation.error)}
              />
            )}
            {result &&
              (result.success ? (
                <AlertItem
                  variant="info"
                  title={translate('The relay accepted the message')}
                  body={translate(
                    'It was accepted for {email}. If it does not arrive, the problem is past the relay — check its own logs and the recipient spam folder.',
                    { email: result.email },
                  )}
                />
              ) : (
                <AlertItem
                  variant="error"
                  title={translate('The message was not sent')}
                  body={<code className="text-break">{result.error}</code>}
                />
              ))}
          </ModalDialog>
        </form>
      )}
    />
  );
};
