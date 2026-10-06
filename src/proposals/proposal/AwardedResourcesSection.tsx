import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  AwardedResource,
  proposalProposalsAwardedResourcesDestroy,
} from 'waldur-js-client';

import { AccordionCard, BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  asCostRow,
  AwardComparisonRow,
  awardDiffers,
  awardedResourcesKey,
  AWARDED_RESOURCES_SECTION_ID,
  compareAward,
  isAwardSectionShown,
  useAwardedResources,
} from '@/proposals/awardedResources';
import { getRequestedResourceCost } from '@/proposals/requestedResourceCost';
import { RequestedResourceCostLabel } from '@/proposals/RequestedResourceCostLabel';
import { Proposal } from '@/proposals/types';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import '@/proposals/flushTable.scss';

import { AwardAmountsCell, AwardOfferingCell } from './AwardComparison';

const AwardedResourceFormDialog = lazyComponent(() =>
  import('./AwardedResourceFormDialog').then((module) => ({
    default: module.AwardedResourceFormDialog,
  })),
);

/** Up to three lines; the full note is a hover away. */
const DescriptionCell: FC<{ row: AwardComparisonRow }> = ({ row }) => {
  const description = row.awarded?.description;
  if (!description) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <span className="ellipsis-lines-3 text-break" title={description}>
      {description}
    </span>
  );
};

// Cells normally render on one line with an ellipsis, and every column
// without a width keeps a 150px floor; together they pushed this table past
// the card beside the progress rail. The cells here wrap instead, inside
// widths that add up to the card.
const columns: Column<AwardComparisonRow>[] = [
  {
    title: translate('Offering'),
    render: AwardOfferingCell,
    width: '30%',
    ellipsis: false,
  },
  {
    title: translate('Amounts'),
    render: AwardAmountsCell,
    width: '30%',
    ellipsis: false,
  },
  {
    title: translate('Estimated cost'),
    render: ({ row }) =>
      row.awarded ? (
        <RequestedResourceCostLabel
          cost={getRequestedResourceCost(asCostRow(row.awarded))}
          stacked
        />
      ) : (
        <>{renderFieldOrDash(null)}</>
      ),
    width: '15%',
    ellipsis: false,
  },
  {
    title: translate('Description'),
    render: DescriptionCell,
    width: '25%',
    ellipsis: false,
  },
];

const AwardItemActions: FC<{
  row: AwardedResource;
  proposal: Proposal;
}> = ({ row, proposal }) => {
  const { openDialog } = useModal();
  const edit = useCallback(
    () =>
      openDialog(AwardedResourceFormDialog, {
        resolve: { proposal, awardedResource: row },
        size: 'lg',
      }),
    [openDialog, proposal, row],
  );
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsAwardedResourcesDestroy({
        path: { uuid: proposal.uuid, obj_uuid: row.uuid },
      }),
    confirmation: {
      title: translate('Remove awarded resource'),
      body: translate('Remove {offering} from the award?', {
        offering: row.requested_offering.offering_name,
      }),
    },
    successMessage: translate('Awarded resource has been removed.'),
    errorMessage: translate('Unable to remove the awarded resource.'),
    invalidateQueries: [{ queryKey: awardedResourcesKey(proposal.uuid) }],
  });
  return (
    <ActionsDropdown row={row}>
      <ActionItem
        action={edit}
        title={translate('Edit')}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <RemovalActionItem
        action={() => remove.mutate()}
        title={translate('Remove')}
        disabled={remove.isPending}
      />
    </ActionsDropdown>
  );
};

interface AwardedResourcesSectionProps {
  proposal: Proposal;
  /** Call manager (or staff) while the allocation decision is active. */
  editable: boolean;
  /** The allocation decision is still open, so the award may yet change. */
  decisionOpen?: boolean;
  /**
   * The decision is recorded but held for the round's publication; only the
   * call team is told.
   */
  decisionHeld?: boolean;
}

/**
 * What the allocation decision grants, set against what was requested.
 *
 * The award starts as a copy of the request when the decision opens; the call
 * manager may then change amounts, move an item to another accepted offering
 * of the call, add or remove items until the decision is completed, and it is
 * what allocation provisions. Everyone else who may read it sees it read-only.
 * A viewer the backend refuses (applicant before release, reviewers) gets
 * nothing: the section is not theirs to see, which is not an error.
 */
export const AwardedResourcesSection: FC<AwardedResourcesSectionProps> = ({
  proposal,
  editable,
  decisionOpen,
  decisionHeld,
}) => {
  const { openDialog } = useModal();
  const queryClient = useQueryClient();
  const awards = useAwardedResources(proposal.uuid, true);
  const requests = useProposalResourceRows(proposal.uuid);

  const rows = useMemo(
    () =>
      awards.data ? compareAward(requests.data ?? [], awards.data) : undefined,
    [awards.data, requests.data],
  );

  // The rows live in the queries above; the version puts a change to either
  // into the table's query key, so an edit refreshes the table.
  const version = `${awards.dataUpdatedAt}-${requests.dataUpdatedAt}`;
  const filter = useMemo(() => ({ version }), [version]);
  const tableProps = useTable({
    table: `ProposalAwardedResources-${proposal.uuid}`,
    fetchData: () =>
      Promise.resolve({ rows: rows ?? [], resultCount: rows?.length ?? 0 }),
    filter,
  });

  // A component identity per proposal, not per render: a fresh inline
  // component would remount every row's menu on each render.
  const rowActions = useMemo(
    () =>
      editable
        ? ({ row }: { row: AwardComparisonRow }) =>
            row.awarded ? (
              <AwardItemActions row={row.awarded} proposal={proposal} />
            ) : null
        : undefined,
    [editable, proposal],
  );

  const openAdd = useCallback(
    () =>
      openDialog(AwardedResourceFormDialog, {
        resolve: { proposal },
        size: 'lg',
      }),
    [openDialog, proposal],
  );

  // Still loading shows the card with a spinner; once loaded, the same rule
  // as the page's progress rail decides.
  if (
    awards.data !== undefined &&
    !isAwardSectionShown(awards.data, editable)
  ) {
    return null;
  }

  const differs = rows ? awardDiffers(rows) : false;

  return (
    <AccordionCard
      id={AWARDED_RESOURCES_SECTION_ID}
      title={translate('Awarded resources')}
      subtitle={
        editable
          ? translate(
              'What the allocation decision grants. It starts as a copy of the request: change amounts, move an item to another offering of the call, or add and remove items.',
            )
          : decisionHeld
            ? translate(
                'Decided and held until the round publishes its results: what the allocation decision grants, beside the request. Reopen the decision to change it.',
              )
            : decisionOpen
              ? translate(
                  'Being decided: what the allocation decision grants so far, beside the request.',
                )
              : translate(
                  'What the allocation decision granted, beside the request.',
                )
      }
      actions={
        editable ? (
          <BaseButton
            label={translate('Add item')}
            iconNode={<PlusCircleIcon weight="bold" />}
            onClick={openAdd}
            variant="tertiary"
          />
        ) : differs ? (
          <span className="text-warning fw-semibold fs-7">
            {translate('Differs from the request')}
          </span>
        ) : undefined
      }
      defaultOpen
    >
      {awards.isLoading || requests.isLoading ? (
        <LoadingSpinner />
      ) : awards.error ? (
        <LoadingErred
          loadData={() =>
            queryClient.invalidateQueries({
              queryKey: awardedResourcesKey(proposal.uuid),
            })
          }
        />
      ) : (
        <Table<AwardComparisonRow>
          // The table redraws a row only when its data changes, never for a
          // new rowActions alone, so completing the decision would leave the
          // menu on every row. Mount a fresh table when editing opens or
          // closes.
          key={editable ? 'editable' : 'read-only'}
          {...tableProps}
          className="proposal-flush-table"
          cardBordered={false}
          title={null}
          hasActionBar={false}
          hideRefresh
          placeholderHasRetry={false}
          minHeight="auto"
          verboseName={translate('awarded resources')}
          emptyMessage={translate('Nothing is awarded yet.')}
          columns={columns}
          rowActions={rowActions}
        />
      )}
    </AccordionCard>
  );
};
