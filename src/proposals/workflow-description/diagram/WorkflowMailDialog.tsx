import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProposalsWorkflowMailsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface WorkflowMailDialogProps {
  resolve: {
    proposalUuid: string;
    /** The email log rows of one row of the proposal's mail table. */
    emailLogUuids: string[];
    title: string;
  };
}

/**
 * A workflow mail as it went out: to whom, its subject and its text, one
 * per message when the mail was sent to each recipient separately.
 */
export const WorkflowMailDialog: FC<WorkflowMailDialogProps> = ({
  resolve: { proposalUuid, emailLogUuids, title },
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProposalWorkflowMails', proposalUuid, emailLogUuids],
    queryFn: async () =>
      (
        await proposalProposalsWorkflowMailsList({
          path: { uuid: proposalUuid },
          query: { uuid: emailLogUuids },
        })
      ).data,
  });
  return (
    <ModalDialog
      title={title}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : !data?.length ? (
        <p className="text-tertiary mb-0">
          {translate('The text of this mail was not kept.')}
        </p>
      ) : (
        <div className="flex flex-col gap-5" data-testid="workflow-mails">
          {data.map((mail) => (
            <section key={mail.uuid} className="flex flex-col gap-1.5">
              <dl className="mb-0">
                <div className="flex gap-1.5">
                  <dt className="text-tertiary font-normal">
                    {translate('Sent')}
                  </dt>
                  <dd className="mb-0">{formatDateTime(mail.sent_at)}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-tertiary font-normal">
                    {translate('To')}
                  </dt>
                  <dd className="mb-0 wrap-anywhere">
                    {mail.emails.join(', ')}
                  </dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-tertiary font-normal">
                    {translate('Subject')}
                  </dt>
                  <dd className="mb-0 font-medium">{mail.subject}</dd>
                </div>
              </dl>
              <pre className="mb-0 p-3 rounded-lg border border-secondary bg-secondary whitespace-pre-wrap break-words font-sans">
                {mail.body}
              </pre>
            </section>
          ))}
        </div>
      )}
    </ModalDialog>
  );
};
