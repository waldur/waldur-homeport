import {
  ArrowsClockwiseIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { Table } from 'react-bootstrap';
import { Issue, supportIssuesSync } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

interface ProcessingLogEntry {
  event: string;
  details: Record<string, unknown>;
  timestamp: string;
}

const formatEventName = (event: string) => {
  return event
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const IssueLogDialog = ({ issue }: { issue: Issue }) => {
  const processingLog = (issue as any).processing_log as
    ProcessingLogEntry[] | undefined;

  return (
    <ModalDialog title={translate('Processing log')} bodyClassName="p-0">
      {processingLog && processingLog.length > 0 ? (
        <Table responsive striped className="mb-0">
          <thead>
            <tr>
              <th>{translate('Timestamp')}</th>
              <th>{translate('Event')}</th>
              <th>{translate('Details')}</th>
            </tr>
          </thead>
          <tbody>
            {processingLog.map((entry, index) => (
              <tr key={index}>
                <td className="text-nowrap">
                  {formatDateTime(entry.timestamp)}
                </td>
                <td className="text-nowrap">{formatEventName(entry.event)}</td>
                <td>
                  <code className="small">
                    {JSON.stringify(entry.details, null, 2)}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="p-6 text-muted text-center">
          {translate('No processing log entries.')}
        </div>
      )}
    </ModalDialog>
  );
};

export const IssueLogButton = ({ issue }) => {
  const { openDialog } = useModal();
  const user = useUser();
  const staffOrSupport = user?.is_staff || user?.is_support;

  if (!staffOrSupport) {
    return null;
  }

  const callback = () =>
    openDialog(IssueLogDialog, {
      size: 'lg',
      issue,
    });

  return (
    <SubmitButton
      submitting={false}
      type="button"
      variant="secondary"
      onClick={callback}
      label={translate('Show log')}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  );
};

export const IssueSyncButton = ({
  issue,
  refetch,
}: {
  issue: Issue;
  refetch: () => void;
}) => {
  const user = useUser();
  const staffOrSupport = user?.is_staff || user?.is_support;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => supportIssuesSync({ path: { uuid: issue.uuid } }),
    successMessage: translate('Issue synchronized successfully.'),
    errorMessage: translate('Unable to sync issue.'),
    refetch,
  });

  if (!staffOrSupport) {
    return null;
  }

  return (
    <SubmitButton
      submitting={isPending}
      type="button"
      variant="secondary"
      onClick={() => mutate()}
      disabled={isPending}
      label={translate('Sync')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      iconOnLeft
    />
  );
};
