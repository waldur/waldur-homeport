import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  AwardedResource,
  OfferingAssessment,
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
import { PROPOSAL_FLUSH_TABLE_CLASS } from '@/proposals/flushTable';
import { getRequestedResourceCost } from '@/proposals/requestedResourceCost';
import {
  pricesConcealed,
  RequestedResourceCostLabel,
} from '@/proposals/RequestedResourceCostLabel';
import { RankingRecommendation } from '@/proposals/round/ranking/RankingRecommendation';
import { Proposal } from '@/proposals/types';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { useConfirmApplicantChange } from './actingForApplicant';
import { AwardDetails, AwardOfferingCell } from './AwardComparison';
import { AwardedDuration } from './AwardedDuration';
import { OfferingAssessmentNote } from './contributions/OfferingAssessmentNote';
import { useOfferingAssessments } from './contributions/queries';
import { OwnOfferingsNote } from './OwnOfferingsNote';
import { sectionOpenProps, useSectionOpenState } from './sectionOpen';

const AwardedResourceFormDialog = lazyComponent(() =>
  import('./AwardedResourceFormDialog').then((module) => ({
    default: module.AwardedResourceFormDialog,
  })),
);

/** The assessments of the offering the item was requested on, by step. */
const assessmentsFor = (
  row: AwardComparisonRow,
  assessments: Record<string, OfferingAssessment[]>,
) =>
  assessments[(row.requested ?? row.awarded)?.requested_offering?.uuid ?? ''] ??
  [];

// One line a row; the plan, options, amounts and who changed an item are in
// its expanded row, as other tables keep their details.
const getColumns = (): Column<AwardComparisonRow>[] => [
  {
    title: translate('Offering'),
    render: ({ row }) => <AwardOfferingCell row={row} />,
    width: '40%',
  },
  ...(pricesConcealed()
    ? []
    : [
        {
          title: translate('Estimated cost'),
          render: ({ row }) =>
            row.awarded ? (
              <RequestedResourceCostLabel
                cost={getRequestedResourceCost(asCostRow(row.awarded))}
              />
            ) : (
              <>{renderFieldOrDash(null)}</>
            ),
          width: '20%',
        },
      ]),
  {
    title: translate('Description'),
    render: ({ row }) => <>{renderFieldOrDash(row.awarded?.description)}</>,
    // The widths add up to the card beside the progress rail.
    width: pricesConcealed() ? '60%' : '40%',
  },
];

const AwardItemActions: FC<{
  row: AwardedResource;
  proposal: Proposal;
}> = ({ row, proposal }) => {
  const { openDialog } = useModal();
  const confirmChange = useConfirmApplicantChange(proposal);
  const offering = row.requested_offering.offering_name;
  const edit = useCallback(async () => {
    const confirmed = await confirmChange(
      translate(
        'Change the amounts, plan or offering of {offering} in the award.',
        { offering },
      ),
      { applicantTold: false, title: translate('Change the award') },
    );
    if (!confirmed) return;
    openDialog(AwardedResourceFormDialog, {
      resolve: { proposal, awardedResource: row },
      size: 'lg',
    });
  }, [confirmChange, openDialog, proposal, row, offering]);
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsAwardedResourcesDestroy({
        path: { uuid: proposal.uuid, obj_uuid: row.uuid },
      }),
    successMessage: translate('Awarded resource has been removed.'),
    errorMessage: translate('Unable to remove the awarded resource.'),
    invalidateQueries: [{ queryKey: awardedResourcesKey(proposal.uuid) }],
  });
  const confirmRemove = useCallback(async () => {
    const confirmed = await confirmChange(
      translate('Remove {offering} from the award.', { offering }),
      {
        applicantTold: false,
        title: translate('Remove awarded resource'),
        positiveButton: translate('Remove'),
        alwaysAsk: true,
      },
    );
    if (confirmed) remove.mutate();
  }, [confirmChange, offering, remove]);
  return (
    <ActionsDropdown row={row}>
      <ActionItem
        action={edit}
        title={translate('Edit')}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <RemovalActionItem
        action={confirmRemove}
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
  /** Reloads the proposal, whose awarded duration the section may change. */
  refetch?: () => void;
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
  refetch,
}) => {
  const openState = useSectionOpenState();
  const { openDialog } = useModal();
  const queryClient = useQueryClient();
  const awards = useAwardedResources(proposal.uuid, true);
  const requests = useProposalResourceRows(proposal.uuid);
  // The per-offering technical assessment, beside what is awarded on each
  // offering: the call manager decides with its outcomes and conditions.
  const { data: assessmentList } = useOfferingAssessments(proposal.uuid);
  const columns = useMemo(() => getColumns(), []);
  const assessments = useMemo(
    () =>
      (assessmentList ?? []).reduce<Record<string, OfferingAssessment[]>>(
        (byOffering, assessment) => {
          (byOffering[assessment.requested_offering_uuid] ??= []).push(
            assessment,
          );
          return byOffering;
        },
        {},
      ),
    [assessmentList],
  );
  // showMissingOptions: the call manager editing the award is told what a
  // line still lacks; an applicant or reviewer reading it cannot act on that.
  const expandableRow = useMemo(
    () =>
      ({ row }: { row: AwardComparisonRow }) => (
        <ExpandableContainer asTable>
          <AwardDetails row={row} showMissingOptions={editable}>
            {assessmentsFor(row, assessments).map((assessment) => (
              <OfferingAssessmentNote
                key={assessment.contribution_uuid}
                assessment={assessment}
              />
            ))}
          </AwardDetails>
        </ExpandableContainer>
      ),
    [assessments, editable],
  );

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

  const confirmChange = useConfirmApplicantChange(proposal);
  const openAdd = useCallback(async () => {
    const confirmed = await confirmChange(
      translate('Add an item to the award that the applicant did not request.'),
      { applicantTold: false, title: translate('Change the award') },
    );
    if (!confirmed) return;
    openDialog(AwardedResourceFormDialog, {
      resolve: { proposal },
      size: 'lg',
    });
  }, [confirmChange, openDialog, proposal]);

  // Nothing until the award has loaded: an applicant is refused it until the
  // decision is released, and a card shown meanwhile would tell them that a
  // decision is under way. Once loaded, the same rule as the page's progress
  // rail decides; a failure other than that refusal is reported.
  if (!awards.error && !isAwardSectionShown(awards.data, editable)) {
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
        editable || differs ? (
          <div className="flex items-center gap-2.5">
            {differs && (
              <span className="text-warning font-semibold text-xs whitespace-nowrap">
                {translate('Differs from the request')}
              </span>
            )}
            {editable && (
              // Outline, as the team's Add when acting for the applicant:
              // a change to what they asked for, not the page's own task.
              <BaseButton
                label={translate('Add item')}
                iconNode={<PlusCircleIcon weight="bold" />}
                onClick={openAdd}
                variant="tertiary"
              />
            )}
          </div>
        ) : undefined
      }
      {...sectionOpenProps(openState, AWARDED_RESOURCES_SECTION_ID, true)}
    >
      <OwnOfferingsNote proposal={proposal} />
      <AwardedDuration
        proposal={proposal}
        editable={editable}
        refetch={refetch}
      />
      <RankingRecommendation
        proposalUuid={proposal.uuid}
        roundUuid={proposal.round?.uuid}
        awards={awards.data}
        requests={requests.data}
        editable={editable}
      />
      {requests.isLoading ? (
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
          // A short list, shown whole.
          hasPagination={false}
          className={PROPOSAL_FLUSH_TABLE_CLASS}
          cardBordered={false}
          title={null}
          hasActionBar={false}
          hideRefresh
          placeholderHasRetry={false}
          minHeight="auto"
          verboseName={translate('awarded resources')}
          emptyMessage={translate('Nothing is awarded yet.')}
          columns={columns}
          expandableRow={expandableRow}
          rowActions={rowActions}
        />
      )}
    </AccordionCard>
  );
};
