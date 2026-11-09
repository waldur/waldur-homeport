import { ArrowBendUpRightIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { OfferingTeamPerson, OfferingTeamSlot } from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { OFFERING_TEAM_PROPOSAL_STATE } from '@/proposals/proposal/proposalView';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { getSlotHolder } from './providerCalls';

const HandOnSlotsDialog = lazyComponent(() =>
  import('./HandOnSlotsDialog').then((module) => ({
    default: module.HandOnSlotsDialog,
  })),
);

/** Who holds the slot, and whether a hand-on was taken up yet. */
export const SlotHolderCell: FC<{ row: OfferingTeamSlot }> = ({ row }) => {
  const holder = getSlotHolder(row);
  if (holder.kind === 'stand-in') {
    return (
      <Badge variant="warning" size="sm" shape="pill" tone="outline">
        {holder.label}
      </Badge>
    );
  }
  if (holder.kind === 'managers') {
    return <span className="text-quaternary">{holder.label}</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span>{holder.label}</span>
      {holder.accepted ? (
        <Badge variant="success" size="sm" shape="pill" tone="outline">
          {translate('Accepted')}
        </Badge>
      ) : (
        <Badge variant="neutral" size="sm" shape="pill" tone="outline">
          {translate('Pending')}
        </Badge>
      )}
    </div>
  );
};

export const SlotDueCell: FC<{ row: OfferingTeamSlot }> = ({ row }) =>
  row.due_at ? (
    <span className="flex items-center gap-1.5">
      {/* Plain: the Overdue badge says it, not the date's colour. */}
      <span>{formatDate(row.due_at)}</span>
      {row.overdue ? (
        <Badge variant="danger" size="sm" shape="pill" tone="outline">
          {translate('Overdue')}
        </Badge>
      ) : null}
    </span>
  ) : (
    <>{renderFieldOrDash(null)}</>
  );

/** The proposal, opened as the provider sees it. */
export const SlotProposalCell: FC<{
  row: OfferingTeamSlot;
  providerUuid: string;
}> = ({ row, providerUuid }) => (
  <div className="flex flex-col">
    <Link
      state={OFFERING_TEAM_PROPOSAL_STATE}
      params={{ uuid: providerUuid, proposal_uuid: row.proposal_uuid }}
      label={row.proposal_name}
    />
    {row.proposal_slug ? (
      <span className="text-quaternary">{row.proposal_slug}</span>
    ) : null}
  </div>
);

interface HandOn {
  requestedOfferingUuid: string;
  people: OfferingTeamPerson[];
  /** Keys of the steps whose slots the team may hand on. */
  stepKeys: string[];
}

interface TeamSlotsTableProps {
  /** Distinguishes the table's state from its neighbours'. */
  tableId: string;
  slots: OfferingTeamSlot[];
  /** When the version changes the rows are read again. */
  version: number;
  providerUuid: string;
  /** Given when some slots can be handed on: enables selecting them. */
  handOn?: HandOn;
  /** Adds a column naming the step: for slots of several steps at once. */
  showStep?: boolean;
  refetch: () => void;
  emptyMessage?: string;
}

/** The selection's "Hand on" button, for the slots of steps that allow it. */
const makeHandOnAction =
  (handOn: HandOn, refetch: () => void): FC<{ rows: OfferingTeamSlot[] }> =>
  ({ rows }) => {
    const { openDialog } = useModal();
    const slots = rows.filter((row) => handOn.stepKeys.includes(row.step_key));
    return (
      <BaseButton
        label={translate('Hand on ({count})', { count: slots.length })}
        iconNode={<ArrowBendUpRightIcon weight="bold" />}
        variant="primary"
        size="sm"
        disabled={!slots.length}
        disabledReason={translate(
          'The selected slots are on steps the offering’s managers do themselves.',
        )}
        onClick={() =>
          openDialog(HandOnSlotsDialog, {
            resolve: {
              requestedOfferingUuid: handOn.requestedOfferingUuid,
              slots,
              people: handOn.people,
              refetch,
            },
          })
        }
      />
    );
  };

/**
 * The slots open now, each with who holds it and when it is due; where a
 * step allows it, select some and hand them to someone on the team.
 */
export const TeamSlotsTable: FC<TeamSlotsTableProps> = ({
  tableId,
  slots,
  version,
  providerUuid,
  handOn,
  showStep,
  refetch,
  emptyMessage,
}) => {
  const filter = useMemo(() => ({ version }), [version]);
  const tableProps = useTable({
    table: tableId,
    // The slots come in one list; the table pages through them.
    fetchData: createClientPaginatedFetcher(slots),
    filter,
  });
  const { resetSelection } = tableProps;
  const selectedCount = tableProps.selectedRows?.length ?? 0;
  const HandOnAction = useMemo(
    () =>
      handOn
        ? makeHandOnAction(handOn, () => {
            resetSelection();
            refetch();
          })
        : undefined,
    [handOn, resetSelection, refetch],
  );

  const columns: Column<OfferingTeamSlot>[] = [
    {
      title: translate('Proposal'),
      render: ({ row }) => (
        <SlotProposalCell row={row} providerUuid={providerUuid} />
      ),
    },
    ...(showStep
      ? [
          {
            title: translate('Step'),
            render: ({ row }: { row: OfferingTeamSlot }) => (
              <>{row.step_name}</>
            ),
          },
        ]
      : []),
    { title: translate('Held by'), render: SlotHolderCell },
    { title: translate('Due'), render: SlotDueCell },
  ];

  return (
    <Table<OfferingTeamSlot>
      {...tableProps}
      minHeight="auto"
      columns={columns}
      verboseName={translate('slots')}
      emptyMessage={emptyMessage ?? translate('Nothing open on this step.')}
      enableMultiSelect={Boolean(HandOnAction) && slots.length > 0}
      multiSelectActions={HandOnAction}
      rowVariant={({ row }) => (row.overdue ? 'danger' : undefined)}
      hideTitle
      // The bar carries only the selection's action: shown once there is one.
      hasActionBar={Boolean(HandOnAction) && selectedCount > 0}
      placeholderHasRetry={false}
    />
  );
};
