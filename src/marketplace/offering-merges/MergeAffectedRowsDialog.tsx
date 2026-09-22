import { FC } from 'react';
import {
  marketplaceOfferingMergesAffectedList,
  OfferingMergeAffectedRow,
} from 'waldur-js-client';

import { HelpTip } from '@/core/HelpTip';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { MergeEntryRow } from './utils';

import './MergeAffectedRowsDialog.scss';

/**
 * Why a row stays behind. Both reasons - nothing on the target matches it, and
 * the target has an equivalent row already - leave the row where it is, and
 * the preview cannot tell them apart per row, so the wording covers both and
 * says nothing invoice-specific: the other common case is an account the
 * target already holds for that user.
 */
const getStaysHelp = () =>
  translate(
    'The merge leaves these rows on the archived source offering, either because nothing on the target matches them or because the target has an equivalent row already. A dash means the merge changes the row, in the way the subtitle names.',
  );

/**
 * The current value and what it becomes, stacked. Snapshot values run to
 * several lines, so two narrow columns side by side are unreadable; one column
 * that wraps is not.
 */
const ValueChange: FC<{ row: OfferingMergeAffectedRow }> = ({ row }) => (
  <div className="d-flex flex-column gap-1">
    <span>{renderFieldOrDash(row.old_value)}</span>
    {row.kept_on_source ? (
      <span className="text-muted fs-8">
        {translate('Unchanged: it stays on the archived source.')}
      </span>
    ) : (
      <span className="d-flex align-items-start gap-2">
        <span className="text-muted fs-8 text-nowrap pt-1">
          {translate('becomes')}
        </span>
        <span className="fw-semibold">{renderFieldOrDash(row.new_value)}</span>
      </span>
    )}
  </div>
);

interface MergeAffectedRowsDialogProps {
  resolve: {
    mergeUuid: string;
    entry: MergeEntryRow;
  };
}

/**
 * The objects one preview entry changes, a page at a time. Read-only: the
 * merge itself is run from the wizard, never from here.
 */
export const MergeAffectedRowsDialog: FC<MergeAffectedRowsDialogProps> = ({
  resolve: { mergeUuid, entry },
}) => {
  const tableProps = useTable({
    table: `OfferingMergeAffected-${mergeUuid}-${entry.label}`,
    fetchData: createFetcher(marketplaceOfferingMergesAffectedList, {
      path: { uuid: mergeUuid },
      query: { entry: entry.label },
    }),
  });

  return (
    <ModalDialog
      title={
        <span className="d-flex align-items-center gap-2">
          {entry.title}
          <HelpTip
            label={translate(
              'The rows this count covers, with the value each one carries now and the value it carries after the merge.',
            )}
          />
        </span>
      }
      subtitle={
        <span className="d-flex flex-wrap align-items-center gap-2">
          {entry.effectTitle}
          <code className="fs-8">{entry.label}</code>
        </span>
      }
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Object'),
            render: ({ row }) => <>{row.description}</>,
            // These are snapshot strings, not identifiers: they must wrap
            // rather than end in an ellipsis nobody can expand.
            ellipsis: false,
            width: '32%',
          },
          {
            title: translate('What changes'),
            render: ({ row }) => <ValueChange row={row} />,
            ellipsis: false,
            // The widest column: it holds two values, one above the other.
            width: '52%',
          },
          {
            title: (
              <span className="d-inline-flex align-items-center gap-2">
                {translate('Stays on the source')}
                <HelpTip label={getStaysHelp()} />
              </span>
            ),
            render: ({ row }) =>
              row.kept_on_source ? (
                <StateIndicator
                  label={translate('Stays on the source')}
                  variant="warning"
                  tone="outline"
                  shape="pill"
                />
              ) : (
                <>{renderFieldOrDash(null)}</>
              ),
            ellipsis: false,
            // Only ever a dash or a short pill.
            width: '16%',
          },
        ]}
        verboseName={translate('affected rows')}
        rowKey="id"
        className="merge-affected-table"
        hideTitle
        hasActionBar={false}
      />
    </ModalDialog>
  );
};
