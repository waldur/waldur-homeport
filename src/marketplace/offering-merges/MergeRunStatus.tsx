import { FC } from 'react';
import {
  OfferingMerge,
  OfferingMergeCheck,
  OfferingMergeExecuteReport,
  OfferingMergeUndoReport,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { BaseButton } from '@/core/buttons/BaseButton';
import { formatDateTime } from '@/core/dateUtils';
import { ProgressBar } from '@/core/ProgressBar';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';

import { MergeCheckDetailsDialog } from './MergeCheckDetailsDialog';
import { StaticTable } from './StaticTable';
import { isActive, summarizeCheckDetails } from './utils';

const PassedBadge: FC<{ passed: boolean }> = ({ passed }) => (
  <StateIndicator
    label={passed ? translate('Passed') : translate('Failed')}
    variant={passed ? 'success' : 'danger'}
    tone="outline"
    shape="pill"
  />
);

/**
 * The details as one line, opening the dialog that renders them in full. The
 * payloads are nested objects; a row of raw JSON truncated mid-value is what
 * this replaces.
 */
const CheckDetails: FC<{ check: OfferingMergeCheck }> = ({ check }) => {
  const { openDialog } = useModal();
  const summary = summarizeCheckDetails(check.details);
  if (!summary) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <BaseButton
      variant="text-primary"
      size="sm"
      className="p-0 text-start text-truncate mw-100"
      label={summary}
      tooltip={translate('Show the check details')}
      onClick={() =>
        openDialog(MergeCheckDetailsDialog, {
          resolve: { check },
          size: 'lg',
        })
      }
    />
  );
};

export const MergeProgress: FC<{ merge: OfferingMerge }> = ({ merge }) => {
  if (!isActive(merge.state)) {
    return null;
  }
  const progress = merge.progress;
  return (
    <div className="d-flex flex-column gap-2" data-testid="merge-progress">
      <span className="fw-semibold">
        {merge.state === 'undoing'
          ? translate('Undoing the merge…')
          : merge.state === 'queued'
            ? translate('Waiting for a worker…')
            : translate('Merging…')}
      </span>
      {progress ? (
        <>
          <ProgressBar
            now={progress.steps_done}
            max={Math.max(progress.steps_total, 1)}
            showValue
          />
          <span className="text-muted fs-7">
            {translate(
              'Step {done} of {total}: {step}. Rows {rowsDone} of {rowsTotal}.',
              {
                done: progress.steps_done,
                total: progress.steps_total,
                step: progress.step,
                rowsDone: progress.rows_done,
                rowsTotal: progress.rows_total,
              },
            )}
          </span>
        </>
      ) : (
        <ProgressBar now={0} max={1} />
      )}
    </div>
  );
};

const VerificationReport: FC<{
  title: string;
  report: OfferingMergeExecuteReport | OfferingMergeUndoReport;
  tableId: string;
}> = ({ title, report, tableId }) => (
  <StaticTable<OfferingMergeCheck>
    table={tableId}
    help={translate(
      'Checks run automatically right after the operation, in the same transaction. A failed check rolls nothing back: it tells you to undo.',
    )}
    title={
      <span className="d-flex align-items-center gap-3">
        {title}
        <PassedBadge passed={report.passed} />
        <span className="text-muted fs-7 fw-normal">
          {formatDateTime(report.checked_at)}
        </span>
      </span>
    }
    verboseName={translate('Checks')}
    rows={report.checks}
    columns={[
      {
        title: translate('Check'),
        render: ({ row }) => <code className="fs-7">{row.code}</code>,
      },
      {
        title: translate('Result'),
        render: ({ row }) => <PassedBadge passed={row.passed} />,
      },
      {
        title: translate('Details'),
        render: ({ row }) => <CheckDetails check={row} />,
        ellipsis: true,
      },
    ]}
  />
);

export const MergeVerification: FC<{ merge: OfferingMerge }> = ({ merge }) => {
  const verification = merge.verification;
  return (
    <div className="d-flex flex-column gap-4">
      {merge.error_message ? (
        <AlertItem
          variant="error"
          title={translate('The last task reported an error')}
          body={merge.error_message}
        />
      ) : null}
      {verification?.execute ? (
        <VerificationReport
          title={translate('Verification after the merge')}
          report={verification.execute}
          tableId={`OfferingMergeChecks-execute-${merge.uuid}`}
        />
      ) : null}
      {verification?.undo ? (
        <VerificationReport
          title={translate('Verification after the undo')}
          report={verification.undo}
          tableId={`OfferingMergeChecks-undo-${merge.uuid}`}
        />
      ) : null}
    </div>
  );
};
