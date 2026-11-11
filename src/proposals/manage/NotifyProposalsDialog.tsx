import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  NotifyProposalsRequest,
  NotifyProposalsResponse,
  proposalProtectedCallsNotifyProposals,
} from 'waldur-js-client';

import { formatErrorObject, getErrorBody } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { RadioGroup, StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

interface NotifyProposalsValues {
  recipients: NotifyProposalsRequest['recipients'];
  subject: string;
  body: string;
}

interface NotifyProposalsDialogProps {
  resolve: {
    callUuid: string;
    proposalUuids: string[];
    /** Names the proposal in the title when the message is to one. */
    proposalName?: string;
    refetch?(): void;
  };
}

// A line break in a mail header would break the send; the backend refuses it.
const singleLine = (value?: string) =>
  value && /[\r\n]/.test(value)
    ? translate('Subject must be a single line.')
    : undefined;

/**
 * A call manager's own message to the applicants of the chosen proposals:
 * one mail per recipient per proposal, recorded on each proposal's activity,
 * which the applicant reads too.
 */
export const NotifyProposalsDialog: FC<NotifyProposalsDialogProps> = ({
  resolve: { callUuid, proposalUuids, proposalName, refetch },
}) => {
  const count = proposalUuids.length;
  const {
    showSuccess,
    showError,
    showErrorResponse,
    showRedirectMessage: showWarning,
  } = useNotify();
  const send = useManagedMutation<
    { data: NotifyProposalsResponse },
    any,
    NotifyProposalsValues
  >({
    mutationFn: (values) =>
      proposalProtectedCallsNotifyProposals({
        path: { uuid: callUuid },
        body: { proposal_uuids: proposalUuids, ...values },
      }),
    // Said from the answer: a proposal nobody on it receives mail for is
    // skipped, and the manager is told which, to follow up another way.
    onSuccess: ({ data }) => {
      const notified = data?.proposals_notified ?? 0;
      const skipped = data?.skipped_proposals ?? [];
      if (notified) {
        showSuccess(
          proposalName && !skipped.length
            ? translate(
                'The message is being sent to the applicants of {name}.',
                { name: proposalName },
              )
            : translate(
                'The message is being sent to the applicants of {count} proposals.',
                { count: notified },
              ),
        );
      }
      if (skipped.length) {
        showWarning(
          skipped.length === 1
            ? translate('Not sent for 1 proposal')
            : translate('Not sent for {count} proposals', {
                count: skipped.length,
              }),
          skipped
            .map(
              (row) =>
                `${row.proposal_name || row.proposal_uuid}: ${row.reason}`,
            )
            .join('\n'),
        );
      }
    },
    // A refusal says why in words of its own -- mail switched off on the
    // site, a subject that is not one line -- so it is shown as said, not
    // behind the status line the shared formatter puts first.
    onError: (error) => {
      const title = translate('Unable to send the message.');
      const status = error?.status ?? error?.response?.status;
      const body = status === 400 ? getErrorBody(error) : undefined;
      const reason = body ? formatErrorObject(body) : '';
      if (reason) {
        showError(`${title} ${reason}`);
      } else {
        showErrorResponse(error, title);
      }
    },
    refetch,
  });

  return (
    <Form<NotifyProposalsValues>
      onSubmit={(values) => send.mutate(values)}
      initialValues={{ recipients: 'applicant' }}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              proposalName
                ? translate('Message the applicants of {name}', {
                    name: proposalName,
                  })
                : count === 1
                  ? translate('Message the applicants of 1 proposal')
                  : translate('Message the applicants of {count} proposals', {
                      count,
                    })
            }
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={send.isPending}
                  label={translate('Send')}
                />
              </>
            }
          >
            <RadioGroup
              name="recipients"
              label={translate('Send to')}
              required
              choices={[
                {
                  value: 'applicant',
                  label: translate('The applicant'),
                  description: translate(
                    "The proposal's author, or its managers once the author has left the team, with the roles the call copies on mail to the applicant.",
                  ),
                },
                {
                  value: 'team',
                  label: translate('The whole proposal team'),
                  description: translate('Everyone on the proposal team now.'),
                },
              ]}
            />
            <StringGroup
              name="subject"
              label={translate('Subject')}
              required
              maxLength={255}
              validate={(value) => required(value) || singleLine(value)}
            />
            <TextGroup
              name="body"
              label={translate('Message')}
              required
              validate={required}
              description={translate(
                'Each mail links to its proposal. The proposal activity records that you sent it, with the subject.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
