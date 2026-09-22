import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { OfferingMergePreview, OfferingMergeStateEnum } from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { MergeAffectedRowsDialog } from './MergeAffectedRowsDialog';
import { SectionHeading } from './SectionHeading';
import { StaticTable } from './StaticTable';
import {
  getAreaHelp,
  groupMergeEntries,
  listsFromJournal,
  MergeEntryRow,
} from './utils';

/** What the whole panel is, for the heading that stands in for it. */
export const getChangesHelp = () =>
  translate(
    'What the merge would do if it ran now. It is computed again when the merge runs, and the run is refused if anything changed since.',
  );

/**
 * The count, as a button when the API can list the rows behind it. A count
 * whose rows cannot be listed stays plain text rather than a dead link: a
 * recomputed summary, a preview stored before the drill-down existed, or —
 * once the merge has run and the endpoint reads its journal — a row the merge
 * deliberately never wrote.
 */
const EntryCount: FC<{
  row: MergeEntryRow;
  mergeUuid: string;
  listable?: boolean;
}> = ({ row, mergeUuid, listable = true }) => {
  const { openDialog } = useModal();
  if (!listable || !row.canListRows || row.count === 0) {
    return <>{row.count}</>;
  }
  return (
    <BaseButton
      variant="text-primary"
      size="sm"
      className="p-0"
      // The count alone announces as a bare number; the hidden half is what
      // names the button, so the visible one is kept out of the a11y tree.
      label={
        <>
          <span aria-hidden="true">{row.count}</span>
          <span className="visually-hidden">
            {translate('{count} affected rows of {title}', {
              count: row.count,
              title: row.title,
            })}
          </span>
        </>
      }
      iconNode={<MagnifyingGlassIcon weight="bold" />}
      tooltip={translate('Show the affected rows')}
      onClick={() =>
        openDialog(MergeAffectedRowsDialog, {
          resolve: { mergeUuid, entry: row },
          // Snapshot values run long; the drill-down needs the width.
          size: 'xl',
        })
      }
    />
  );
};

const EntryEffect: FC<{ row: MergeEntryRow; fromJournal: boolean }> = ({
  row,
  fromJournal,
}) => (
  <div className="d-flex flex-column">
    <span>{renderFieldOrDash(row.effectTitle)}</span>
    {row.leftOnSource > 0 && (
      <span className="text-muted fs-8">
        {fromJournal
          ? translate(
              '{count} of them stayed on the source; they are not in the list.',
              { count: row.leftOnSource },
            )
          : translate('{count} of them stay on the source.', {
              count: row.leftOnSource,
            })}
      </span>
    )}
  </div>
);

interface MergeEntriesViewProps {
  preview: OfferingMergePreview;
  mergeUuid: string;
  /** The record's state: it decides what the drill-down can still list. */
  mergeState?: OfferingMergeStateEnum;
  tableId: string;
}

/**
 * What a merge does to the rows it covers, one table per area of the service,
 * with the entries that stay on the archived source in their own section so
 * the panel never presents them as moving.
 */
export const MergeEntriesView: FC<MergeEntriesViewProps> = ({
  preview,
  mergeUuid,
  mergeState,
  tableId,
}) => {
  const { areas, keptOnSource, legacy } = useMemo(
    () => groupMergeEntries(preview),
    [preview],
  );
  // Once the merge has run the endpoint lists what it wrote. It never wrote
  // the rows it keeps on the source, so those counts lose their drill-down
  // rather than opening an empty list.
  const fromJournal = listsFromJournal(mergeState);

  const titleColumn: Column<MergeEntryRow> = {
    title: translate('What it is'),
    render: ({ row }) => <>{row.title}</>,
  };
  const countColumn: Column<MergeEntryRow> = {
    title: translate('Rows'),
    render: ({ row }) => <EntryCount row={row} mergeUuid={mergeUuid} />,
  };

  if (areas.length === 0 && keptOnSource.length === 0) {
    return (
      <section>
        <SectionHeading
          title={translate('What the merge changes')}
          help={getChangesHelp()}
          className="mb-3"
        />
        <p className="text-muted mb-0">{translate('Nothing to move.')}</p>
      </section>
    );
  }

  return (
    <div className="d-flex flex-column gap-5">
      {areas.map((area) => (
        <section key={area.key}>
          <SectionHeading
            title={area.title}
            help={getAreaHelp(area.key) ?? getChangesHelp()}
            className="mb-3"
          />
          <StaticTable<MergeEntryRow>
            table={`${tableId}-area-${area.key}`}
            verboseName={translate('rows')}
            rows={area.rows}
            rowKey="label"
            columns={[
              titleColumn,
              {
                title: translate('What happens'),
                render: ({ row }) => (
                  <EntryEffect row={row} fromJournal={fromJournal} />
                ),
              },
              countColumn,
            ]}
          />
        </section>
      ))}

      {keptOnSource.length > 0 && (
        <section>
          <SectionHeading
            title={
              legacy
                ? translate('Rows the target already has')
                : translate('What stays on the sources')
            }
            help={
              legacy
                ? undefined
                : translate(
                    'Rows that deliberately stay with the archived source offerings: their own plans and components, consents, offering-level policies and roles. They are not moved, and the sources are archived rather than deleted.',
                  )
            }
            className="mb-1"
          />
          <p className="text-muted fs-7">
            {legacy
              ? translate(
                  'These rows would have moved, but the target has an equivalent already, so they stay where they are.',
                )
              : translate(
                  'These rows describe the source offerings themselves. They are not moved and stay with the archived sources.',
                )}
            {fromJournal && (
              <>
                {' '}
                {translate(
                  'The merge never wrote them, so there is nothing to list once it has run.',
                )}
              </>
            )}
          </p>
          <StaticTable<MergeEntryRow>
            table={`${tableId}-kept-on-source`}
            verboseName={translate('rows')}
            rows={keptOnSource}
            rowKey="label"
            columns={[
              {
                title: translate('Area'),
                render: ({ row }) => <>{renderFieldOrDash(row.areaTitle)}</>,
              },
              titleColumn,
              {
                ...countColumn,
                render: ({ row }) => (
                  <EntryCount
                    row={row}
                    mergeUuid={mergeUuid}
                    listable={!fromJournal}
                  />
                ),
              },
            ]}
          />
        </section>
      )}
    </div>
  );
};
