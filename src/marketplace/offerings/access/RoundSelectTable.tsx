import { FC, useCallback, useMemo } from 'react';

import { formatDate } from '@/core/dateUtils';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { SubmittableRound } from '@/marketplace/offerings/apply/eligibleCalls';
import { usesCallVocabulary } from '@/proposals/presentation';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RoundExpandableRow } from './RoundExpandableRow';

interface RoundSelectTableProps {
  rounds: SubmittableRound[];
  /** react-final-form field the selected row is bound to. */
  fieldName: string;
}

/**
 * Rounds a proposal can be submitted to, as a picker inside the request dialog.
 *
 * Uses the shared Table rather than a hand-rolled list so the header, sorting
 * and empty state match every other list in the app, and so row selection uses
 * the built-in radio column instead of a bespoke one.
 *
 * There is no status column: only open rounds reach here, so it would read
 * "Open" on every row.
 */
export const RoundSelectTable: FC<RoundSelectTableProps> = ({
  rounds,
  fieldName,
}) => {
  // Rows are already in memory; a stable callback keeps useTable from refetching.
  const fetchData = useCallback(
    () => Promise.resolve({ rows: rounds, resultCount: rounds.length }),
    [rounds],
  );

  const tableProps = useTable({
    table: 'request-access-rounds',
    fetchData,
  });

  // One call behind every row makes the column a repeated constant, exactly as
  // a status column would be. Marketplace-only mode drops it either way: the
  // applicant never navigates to a call, so the header would name something
  // they cannot see anywhere else.
  const spansSeveralCalls =
    new Set(rounds.map((row) => row.call.uuid)).size > 1;
  const showCallColumn = usesCallVocabulary() && spansSeveralCalls;

  // Where the call name is dropped, the managing organisation is what is left
  // to tell two deadlines apart — but only when it differs between them.
  // Repeated under every row it is the same constant the call column is
  // suppressed for being.
  const spansSeveralOrgs =
    new Set(rounds.map((row) => row.call.customer_name)).size > 1;

  const columns = useMemo(
    () =>
      [
        showCallColumn
          ? {
              id: 'call',
              title: translate('Call'),
              render: ({ row }: { row: SubmittableRound }) => (
                <span className="d-flex flex-column">
                  <span className="fw-bold">{row.call.name}</span>
                  <span className="text-muted fs-7">
                    {row.call.customer_name}
                  </span>
                </span>
              ),
            }
          : null,
        {
          id: 'cutoff',
          title: translate('Submission closes'),
          render: ({ row }: { row: SubmittableRound }) => (
            <span className="d-flex flex-column">
              <span>{formatDate(row.round.cutoff_time)}</span>
              {/* Without the column, two rows from different calls would be
                  told apart only by date — and two calls can share one. This
                  branch is reached only where the call column is suppressed
                  because the deployment hides calls, so it names the managing
                  organisation instead: the same disambiguation without the
                  word the rest of this flow has dropped. */}
              {!showCallColumn && spansSeveralCalls && spansSeveralOrgs ? (
                <span className="text-muted fs-7">
                  {row.call.customer_name}
                </span>
              ) : null}
            </span>
          ),
        },
      ].filter(Boolean),
    [showCallColumn, spansSeveralCalls, spansSeveralOrgs],
  );

  return (
    <Table<SubmittableRound>
      {...tableProps}
      columns={columns}
      verboseName={translate('submission deadlines')}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
      cardBordered={false}
      minHeight="auto"
      hoverable
      fieldType="radio"
      fieldName={fieldName}
      validate={required}
      // The deadline alone is thin grounds for choosing between calls; the rest
      // is already on the wire, so let the applicant open it rather than fetch
      // it from somewhere else.
      expandableRow={RoundExpandableRow}
    />
  );
};
