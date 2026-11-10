import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  AwardedResource,
  marketplaceResourcesList,
  projectsListUsersList,
  projectsRetrieve,
  proposalProposalsResourcesList,
  RequestedResource,
  Resource,
  UserRoleDetails,
} from 'waldur-js-client';

import {
  AccordionCard,
  AlertItem,
  Badge,
  PropertyItem,
  PropertyList,
  Tooltip,
} from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { formatDate, formatISODate } from '@/core/dateUtils';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { formatRole } from '@/permissions/utils';
import { ProjectLink } from '@/project/ProjectLink';
import { AwardComparisonRow, isForbidden } from '@/proposals/awardedResources';
import {
  awardedAsRequestedLabel,
  blankAwardRowsNote,
  usesCallVocabulary,
} from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';
import { ResourceLink } from '@/resource/ResourceLink';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import '@/proposals/flushTable.scss';

import { AllocationDecisionComment } from './AllocationDecisionComment';
import {
  AllocationOrderInfo,
  allocationSummary,
  OUTCOME_STATUS_VARIANTS,
  outcomeStatus,
  OutcomeStatus,
  outcomeStatusLabel,
} from './allocationOutcome';
import { AwardAmountsCell, AwardChangeBadge } from './AwardComparison';
import { ProvisionErrorAlert } from './ProvisionErrorAlert';
import { sectionOpenProps, useSectionOpenState } from './sectionOpen';

/**
 * One line of the outcome: what was asked for, what was awarded when an award
 * exists, and the resource that came of it.
 */
interface OutcomeRow {
  uuid: string;
  requestedName?: string;
  awardedName?: string;
  change?: AwardComparisonRow['change'];
  /** The award line it came from, for the amounts when they differ. */
  award?: AwardComparisonRow;
  resource: string | null;
  status: OutcomeStatus;
  rejectionComment?: string | null;
  allocated?: Resource | null;
  /** Why allocation could not order the awarded item; empty once ordered. */
  provisionError?: string;
  /** The awarded item, ordered again by "Provision again". */
  awardedUuid?: string;
}

const fromRequest = (row: RequestedResource): OutcomeRow => {
  const order = row as RequestedResource & AllocationOrderInfo;
  return {
    uuid: row.uuid,
    requestedName: row.requested_offering.offering_name,
    resource: row.resource,
    status: outcomeStatus({
      resource: row.resource,
      offeringState: row.requested_offering.state,
      orderState: order.order_state,
    }),
    rejectionComment: order.order_rejection_comment,
  };
};

// Allocation provisions the award, so it is the award's items that carry the
// resources; a request the award dropped produced nothing.
const fromAward = (row: AwardComparisonRow): OutcomeRow => {
  const awarded = row.awarded as
    (AwardedResource & AllocationOrderInfo) | undefined;
  const resource = awarded?.resource ?? null;
  return {
    uuid: row.uuid,
    requestedName: row.requested?.requested_offering.offering_name,
    awardedName: awarded?.requested_offering.offering_name,
    change: row.change,
    award: row,
    resource,
    status: outcomeStatus({
      resource,
      change: row.change,
      offeringState: (awarded ?? row.requested)?.requested_offering.state,
      orderState: awarded?.order_state,
    }),
    rejectionComment: awarded?.order_rejection_comment,
    provisionError: awarded?.provision_error || undefined,
    awardedUuid: awarded?.uuid,
  };
};

/**
 * What came of one line: the resource and its live state once it is
 * allocated, otherwise why there is none (yet). A dash is kept for the one
 * case nothing explains, with a tooltip saying so.
 */
const AllocatedCell: FC<{
  row: OutcomeRow;
  proposalUuid: string;
  canProvision: boolean;
}> = ({ row, proposalUuid, canProvision }) => {
  if (row.provisionError && row.awardedUuid) {
    return (
      <ProvisionErrorAlert
        proposalUuid={proposalUuid}
        awardedResourceUuid={row.awardedUuid}
        error={row.provisionError}
        canProvision={canProvision}
      />
    );
  }
  if (row.status === 'allocated' && row.resource) {
    return (
      <ResourceLink
        uuid={getUUID(row.resource)}
        label={
          row.allocated ? (
            <ResourceStateField
              resource={row.allocated}
              shape="pill"
              tone="outline"
            />
          ) : (
            translate('Open')
          )
        }
      />
    );
  }
  if (row.status === 'unknown') {
    return (
      <Tooltip
        label={translate(
          'No resource is recorded for this request, and the reason is not available to you.',
        )}
      >
        <span>{renderFieldOrDash(null)}</span>
      </Tooltip>
    );
  }
  return (
    <div className="flex flex-col gap-1 items-start">
      <Badge
        variant={OUTCOME_STATUS_VARIANTS[row.status]}
        shape="pill"
        tone="outline"
      >
        {outcomeStatusLabel(row.status)}
      </Badge>
      {row.status === 'refused' && row.rejectionComment && (
        <span className="text-quaternary whitespace-normal">
          {row.rejectionComment}
        </span>
      )}
      {row.resource && (
        <ResourceLink
          uuid={getUUID(row.resource)}
          label={translate('Open resource')}
        />
      )}
    </div>
  );
};

const tableChrome = {
  // Nested inside a card that already draws a border and its own inset, so the
  // table's own card chrome is dropped entirely — see the stylesheet for the
  // matching horizontal padding.
  cardBordered: false,
  title: null,
  hasActionBar: false,
  hideRefresh: true,
  placeholderHasRetry: false,
  minHeight: 'auto' as const,
  className: 'proposal-flush-table',
};

/**
 * Whether the viewer may read the allocated project. A provider reading only
 * its offerings' part holds no role on it, so it is not asked: the outcome
 * then names the project from the proposal and leaves out its team.
 */
const readsAllocatedProject = (
  proposal: Pick<Proposal, 'reads_own_offerings_only'>,
) => !proposal.reads_own_offerings_only;

/**
 * The allocated project, shared by the banner and the card below it — React
 * Query collapses both callers onto one request via the key.
 */
const useAllocatedProject = (projectUuid: string, enabled = true) =>
  useQuery({
    queryKey: ['proposal-allocated-project', projectUuid],
    queryFn: () =>
      projectsRetrieve({
        path: { uuid: projectUuid },
        query: {
          field: ['name', 'customer_uuid', 'customer_name', 'start_date'],
        },
      })
        .then((r) => r.data)
        // Reviewers hold no role on the created project, so this 404s for
        // them — fall back to the name the proposal already carries.
        .catch(() => null),
    enabled: enabled && Boolean(projectUuid),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  }).data;

export const ALLOCATION_OUTCOME_SECTION_ID = 'step-allocation-outcome';

/**
 * Orders wait in pending-project until the project's start date, so every
 * resource reads "Creating" with nothing saying why. Rendered at the top of the
 * page rather than inside the card: it is a notice about the whole proposal,
 * and unlike the card it stops being true once the date passes.
 */
export const AllocationStartBanner: FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const project = useAllocatedProject(
    getUUID(proposal.project),
    readsAllocatedProject(proposal),
  );
  if (!project?.start_date || project.start_date <= formatISODate(new Date())) {
    return null;
  }
  return (
    <AlertItem
      variant="info"
      type="floating"
      className="bg-primary"
      title={translate('Resources are activated on {date}', {
        date: formatDate(project.start_date),
      })}
      body={translate(
        'The project starts on a future date, so the allocated resources stay in "Creating" until then.',
      )}
    />
  );
};

/**
 * Mounted only once the roles are in hand. useTable's query fires when the
 * hook first runs — not when the Table renders — and replacing the fetchData
 * closure never refetches on its own, so a hook living in the parent would
 * capture the still-undefined roles and present real grants as none.
 */
const AllocatedTeamTable: FC<{
  proposalUuid: string;
  roles: UserRoleDetails[];
}> = ({ proposalUuid, roles }) => {
  const team = useTable({
    table: `ProposalAllocatedTeam-${proposalUuid}`,
    fetchData: () =>
      Promise.resolve({ rows: roles, resultCount: roles.length }),
  });
  return (
    <Table<UserRoleDetails>
      {...team}
      {...tableChrome}
      // A short list, shown whole.
      hasPagination={false}
      verboseName={translate('team members')}
      emptyMessage={translate('No roles were granted on the project.')}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => (
            <span className="font-medium text-primary">
              {renderFieldOrDash(row.user_full_name || row.user_username)}
            </span>
          ),
        },
        {
          title: translate('Project role'),
          render: ({ row }) => (
            <>{renderFieldOrDash(formatRole(row.role_name, 'project'))}</>
          ),
        },
      ]}
    />
  );
};

const AllocationOutcome: FC<{
  proposal: Proposal;
  projectUuid: string;
  awardRows?: AwardComparisonRow[];
  canProvision: boolean;
}> = ({ proposal, projectUuid, awardRows, canProvision }) => {
  const openState = useSectionOpenState();
  const projectReadable = readsAllocatedProject(proposal);
  const project = useAllocatedProject(projectUuid, projectReadable);

  // The award and the requests it is paired with arrive after the table first
  // fetches, in either order; keyed on both, so the rows are rebuilt once each
  // is in hand. Keyed on the request too: an award that loads first pairs with
  // nothing and reads as "added" until the requests catch up.
  const awardFilter = useMemo(
    () => ({
      award: awardRows
        ?.map(
          (row) =>
            `${row.uuid}:${row.requested?.uuid ?? ''}:${row.change}:${
              row.awarded?.resource ?? ''
            }:${
              (row.awarded as AllocationOrderInfo | undefined)?.order_state ??
              ''
            }:${row.awarded?.provision_error ?? ''}`,
        )
        .join(','),
    }),
    [awardRows],
  );

  // Each request records the resource it produced but not its state, so the
  // live states come from the project in a second call. Requests whose offering
  // the provider never accepted produce nothing, and those rows stay: "asked
  // for, got none" is the point of this table.
  const resources = useTable({
    table: `ProposalAllocatedResources-${proposal.uuid}`,
    filter: awardFilter,
    fetchData: async () => {
      const rows: OutcomeRow[] = awardRows?.length
        ? awardRows.map(fromAward)
        : (
            await getAllPages<RequestedResource>((page) =>
              proposalProposalsResourcesList({
                path: { uuid: proposal.uuid },
                query: { page, page_size: MAX_PAGE_SIZE },
              }),
            )
          ).map(fromRequest);
      if (!rows.some((row) => row.resource)) {
        return { rows, resultCount: rows.length };
      }
      // Only the live state comes from here, so a failure costs the badges and
      // nothing else — it must not take the rows, or the page, down with it.
      const created = await getAllPages<Resource>((page) =>
        marketplaceResourcesList({
          query: { page, page_size: MAX_PAGE_SIZE, project_uuid: projectUuid },
        }),
      ).catch(() => []);
      const byUuid = new Map(
        created.map((r) => [r.uuid, r] as [string, Resource]),
      );
      return {
        rows: rows.map((row) => ({
          ...row,
          allocated: row.resource ? byUuid.get(getUUID(row.resource)) : null,
        })),
        resultCount: rows.length,
      };
    },
  });

  const summary = useMemo(
    () =>
      allocationSummary(
        ((resources.rows ?? []) as OutcomeRow[]).map((row) => row.status),
      ),
    [resources.rows],
  );

  // The call maps each proposal role onto a project role, and a mapping may be
  // missing or empty — in which case that person got no access at all. This is
  // the only place that says who actually got in.
  //
  // list_users raises PermissionDenied for a caller who may read the project
  // but not its team (an organisation role without the team permission, say).
  // That 403 resolves to null and the section is dropped: "we cannot show you
  // this" is not the same claim as "nobody was granted a role". Any other
  // failure is a fault, and the section says so instead of disappearing; it
  // stays on this page rather than sending it to the global error screen.
  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesFailed,
  } = useQuery({
    queryKey: ['proposal-allocated-roles', projectUuid],
    queryFn: () =>
      getAllPages<UserRoleDetails>((page) =>
        projectsListUsersList({
          path: { uuid: projectUuid },
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ).catch((error) => {
        if (isForbidden(error)) {
          return null;
        }
        throw error;
      }),
    enabled: projectReadable,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });

  // The award is shown only where it differs from the request. Matching line
  // for line, it is said once above the table instead of an Awarded column
  // that repeats the Requested one; differing somewhere, the column stays but
  // its unchanged lines are left blank, and a note under the table says so.
  const awardDiffers = awardRows?.some((row) => row.change !== 'unchanged');
  const awardedAsRequested = Boolean(awardRows?.length) && !awardDiffers;
  const someUnchanged = awardRows?.some((row) => row.change === 'unchanged');

  return (
    <AccordionCard
      id={ALLOCATION_OUTCOME_SECTION_ID}
      // Named for the outcome rather than the mechanism: sitting above the
      // submission's own cards, the title is what marks the boundary between
      // what was asked for and what came of it.
      title={translate('Allocation outcome')}
      subtitle={
        usesCallVocabulary()
          ? translate('What this proposal produced once it was accepted.')
          : translate('What this request produced once it was approved.')
      }
      {...sectionOpenProps(openState, ALLOCATION_OUTCOME_SECTION_ID, true)}
    >
      <PropertyList
        variant="summary"
        termWidth="sm"
        className={
          project
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-5 text-sm mb-3'
            : 'grid grid-cols-1 gap-x-5 text-sm mb-3'
        }
      >
        <PropertyItem
          label={translate('Project')}
          value={
            // As children, not row.name: ProjectLink only truncates when it
            // has no children, and the generated name is long.
            <ProjectLink
              row={{
                uuid: projectUuid,
                name: project?.name || proposal.project_name,
                customer_uuid: project?.customer_uuid,
              }}
              // Fetched means readable: a call manager holds no project role
              // but may open the projects the call allocated.
              canAccess={project ? true : undefined}
            >
              {project?.name || proposal.project_name}
            </ProjectLink>
          }
        />
        {project && (
          <PropertyItem
            label={translate('Organization')}
            value={project.customer_name}
            hideIfEmpty={false}
          />
        )}
      </PropertyList>

      <AllocationDecisionComment
        proposalUuid={proposal.uuid}
        className="mb-3"
      />

      <h6 className="text-secondary font-medium mb-2.5">
        {translate('Resources:')}
      </h6>
      {awardedAsRequested && (
        <p className="text-quaternary mb-2.5">{awardedAsRequestedLabel()}</p>
      )}
      {summary && <p className="text-quaternary mb-2.5">{summary}</p>}
      <Table<OutcomeRow>
        {...resources}
        {...tableChrome}
        verboseName={translate('requested resources')}
        columns={[
          {
            title: awardedAsRequested
              ? translate('Offering')
              : translate('Requested'),
            render: ({ row }) => <>{renderFieldOrDash(row.requestedName)}</>,
          },
          ...(awardDiffers
            ? [
                {
                  title: translate('Awarded'),
                  render: ({ row }: { row: OutcomeRow }) =>
                    row.change === 'unchanged' ? null : (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {row.awardedName && <span>{row.awardedName}</span>}
                        {row.change && <AwardChangeBadge change={row.change} />}
                        {row.change === 'changed' && row.award && (
                          <div className="w-full text-sm">
                            <AwardAmountsCell row={row.award} />
                          </div>
                        )}
                      </div>
                    ),
                },
              ]
            : []),
          {
            // The created resource is named after the project, so its name is
            // identical on every row and says nothing; the state, linked
            // through, is all this column adds. Where there is no working
            // resource, the column says why.
            title: translate('Allocated'),
            render: ({ row }) => (
              <AllocatedCell
                row={row}
                proposalUuid={proposal.uuid}
                canProvision={canProvision}
              />
            ),
          },
        ]}
      />
      {awardDiffers && someUnchanged && (
        <p className="text-quaternary text-xs mt-2.5 mb-0">
          {blankAwardRowsNote()}
        </p>
      )}

      {!rolesLoading && (roles || rolesFailed) && (
        <>
          <h6 className="text-secondary font-medium mt-5 mb-2.5">
            {translate('Project access:')}
          </h6>
          {roles ? (
            <AllocatedTeamTable proposalUuid={proposal.uuid} roles={roles} />
          ) : (
            <p className="text-danger mb-0">
              {translate('Unable to load who was given access to the project.')}
            </p>
          )}
        </>
      )}
    </AccordionCard>
  );
};

/**
 * What an accepted proposal produced, above the cards rather than among them:
 * those are the submission's own steps, and an outcome is not one of them.
 * Renders once allocate_proposal() has run, which is the same request that
 * makes the proposal accepted.
 */
/** The outcome is on the page once the proposal has produced a project. */
export const showsAllocationOutcome = (proposal: Pick<Proposal, 'project'>) =>
  Boolean(getUUID(proposal.project));

export const AllocationOutcomeSection: FC<{
  proposal: Proposal;
  awardRows?: AwardComparisonRow[];
  /** Whether the viewer manages the call, and so may order a failed item again. */
  canProvision?: boolean;
}> = ({ proposal, awardRows, canProvision = false }) => {
  const projectUuid = getUUID(proposal.project);
  return showsAllocationOutcome(proposal) ? (
    <AllocationOutcome
      proposal={proposal}
      projectUuid={projectUuid}
      awardRows={awardRows}
      canProvision={canProvision}
    />
  ) : null;
};
