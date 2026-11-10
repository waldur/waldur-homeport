import { FC } from 'react';
import { ProposalRun } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { getRunAppliedChanges, runStateLabel } from './postAward';

/** The run's state, and whether the approval left some of the grant undone. */
export const RunStateCell: FC<{ row: ProposalRun }> = ({ row }) => (
  <div className="flex flex-col gap-1 items-start">
    <span>{runStateLabel(row.state)}</span>
    {row.state === 'approved' &&
      Boolean(getRunAppliedChanges(row)?.skipped.length) && (
        <span
          className="text-warning font-semibold"
          data-testid="run-partly-applied"
        >
          {translate('Not all of it was carried out')}
        </span>
      )}
  </div>
);

/** "from 8 Mar 2028 to 30 Jun 2028", or "to 30 Jun 2028" without a previous date. */
const moved = (previous: string | null | undefined, endDate: string) =>
  previous
    ? translate('from {previous} to {end_date}', {
        previous: formatDate(previous),
        end_date: formatDate(endDate),
      })
    : translate('to {end_date}', { end_date: formatDate(endDate) });

/**
 * What an approved extension carried out, and what it left alone and why:
 * a resource not in OK state, a prepaid one, or one whose offering's team
 * did not accept the extension gets no more limits or no later end.
 */
export const RunAppliedChanges: FC<{
  run: ProposalRun;
  /** Resource names by UUID, from the award; a resource not in it is named generically. */
  resourceNames: Record<string, string>;
}> = ({ run, resourceNames }) => {
  const changes = getRunAppliedChanges(run);
  if (!changes) return null;
  const name = (uuid: string) => resourceNames[uuid] || translate('A resource');
  const applied = [
    ...(changes.projectEndDate
      ? [
          translate('Project end date moved {change}', {
            change: moved(
              changes.projectEndDate.previous,
              changes.projectEndDate.end_date,
            ),
          }),
        ]
      : []),
    ...changes.resourceEndDates.map((row) =>
      translate('{resource}: end date moved {change}', {
        resource: name(row.resource_uuid),
        change: moved(row.previous, row.end_date),
      }),
    ),
    ...changes.orders.map((row) =>
      translate(
        '{resource}: more limits ordered, for its provider to approve',
        { resource: name(row.resource_uuid) },
      ),
    ),
  ];
  return (
    <div className="flex flex-col gap-2.5" data-testid="run-applied-changes">
      {applied.length > 0 && (
        <div>
          <div className="font-semibold">
            {translate('What the approval changed')}
          </div>
          <ul className="list-unstyled mb-0">
            {applied.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      {changes.skipped.length > 0 && (
        <div data-testid="run-skipped-changes">
          <div className="font-semibold text-warning">
            {translate('Not carried out')}
          </div>
          <ul className="list-unstyled mb-0">
            {changes.skipped.map((row, i) => (
              <li key={`${row.resource_uuid}-${i}`}>
                <span className="font-medium">{name(row.resource_uuid)}</span>
                {': '}
                {row.reason}
              </li>
            ))}
          </ul>
          <p className="mb-0 text-quaternary">
            {translate(
              'What was granted for these resources is not ordered later by itself.',
            )}
          </p>
        </div>
      )}
    </div>
  );
};
