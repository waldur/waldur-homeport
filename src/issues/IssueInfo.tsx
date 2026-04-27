import {
  ArrowsClockwiseIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Issue, supportIssuesSync } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { isStaffOrSupport } from '@/workspace/selectors';

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
    | ProcessingLogEntry[]
    | undefined;

  return (
    <ModalDialog
      title={translate('Processing log')}
      closeButton
      bodyClassName="p-0"
    >
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
  const dispatch = useDispatch();
  const staffOrSupport = useSelector(isStaffOrSupport);

  if (!staffOrSupport) {
    return null;
  }

  const callback = () =>
    dispatch(
      openModalDialog(IssueLogDialog, {
        size: 'lg',
        issue,
      }),
    );

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
  const dispatch = useDispatch();
  const staffOrSupport = useSelector(isStaffOrSupport);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // The sync endpoint doesn't need a body, but the generated types require it
      await supportIssuesSync({
        path: { uuid: issue.uuid },
        body: {} as any,
      });
    },
    onSuccess: () => {
      dispatch(showSuccess(translate('Issue synchronized successfully.')));
      refetch();
    },
    onError: (error: Response) => {
      dispatch(showErrorResponse(error, translate('Unable to sync issue.')));
    },
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
