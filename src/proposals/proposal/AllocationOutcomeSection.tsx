import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  marketplaceResourcesList,
  projectsListUsersList,
  projectsRetrieve,
  proposalProposalsResourcesList,
  RequestedResource,
  Resource,
  UserRoleDetails,
} from 'waldur-js-client';

import { AccordionCard, AlertItem } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { formatDate, formatISODate } from '@/core/dateUtils';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { ProjectLink } from '@/project/ProjectLink';
import { AwardComparisonRow } from '@/proposals/awardedResources';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';
import { ResourceLink } from '@/resource/ResourceLink';
import { Field } from '@/resource/summary';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import '@/proposals/flushTable.scss';

import { AwardChangeBadge } from './AwardComparison';

/**
 * One line of the outcome: what was asked for, what was awarded when an award
 * exists, and the resource that came of it.
 */
interface OutcomeRow {
  uuid: string;
  requestedName?: string;
  awardedName?: string;
  change?: AwardComparisonRow['change'];
  resource: string | null;
  allocated?: Resource | null;
}

const fromRequest = (row: RequestedResource): OutcomeRow => ({
  uuid: row.uuid,
  requestedName: row.requested_offering.offering_name,
  resource: row.resource,
});

// Allocation provisions the award, so it is the award's items that carry the
// resources; a request the award dropped produced nothing.
const fromAward = (row: AwardComparisonRow): OutcomeRow => ({
  uuid: row.uuid,
  requestedName: row.requested?.requested_offering.offering_name,
  awardedName: row.awarded?.requested_offering.offering_name,
  change: row.change,
  resource: row.awarded?.resource ?? null,
});

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
 * The allocated project, shared by the banner and the card below it — React
 * Query collapses both callers onto one request via the key.
 */
const useAllocatedProject = (projectUuid: string) =>
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
        // Reviewers hold no role on the created project, so this 403s for
        // them — fall back to the name the proposal already carries.
        .catch(() => null),
    enabled: Boolean(projectUuid),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  }).data;

/**
 * Orders wait in pending-project until the project's start date, so every
 * resource reads "Creating" with nothing saying why. Rendered at the top of the
 * page rather than inside the card: it is a notice about the whole proposal,
 * and unlike the card it stops being true once the date passes.
 */
export const AllocationStartBanner: FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const project = useAllocatedProject(getUUID(proposal.project));
  if (!project?.start_date || project.start_date <= formatISODate(new Date())) {
    return null;
  }
  return (
    <AlertItem
      variant="info"
      type="floating"
      className="bg-body"
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
      verboseName={translate('team members')}
      emptyMessage={translate('No roles were granted on the project.')}
      columns={[
        {
          title: translate('Member'),
          render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
        },
        {
          title: translate('Project role'),
          render: ({ row }) => <>{renderFieldOrDash(row.role_name)}</>,
        },
      ]}
    />
  );
};

const AllocationOutcome: FC<{
  proposal: Proposal;
  projectUuid: string;
  awardRows?: AwardComparisonRow[];
}> = ({ proposal, projectUuid, awardRows }) => {
  const project = useAllocatedProject(projectUuid);

  // The award arrives after the table first fetches; keyed on it so the rows
  // are rebuilt from the award once it is in hand.
  const awardFilter = useMemo(
    () => ({
      award: awardRows
        ?.map((row) => `${row.uuid}:${row.awarded?.resource ?? ''}`)
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

  // The call maps each proposal role onto a project role, and a mapping may be
  // missing or empty — in which case that person got no access at all. This is
  // the only place that says who actually got in.
  //
  // list_users raises PermissionDenied for a caller holding no role on the
  // project's scope tree — which is every reviewer and panel member looking at
  // an accepted proposal. useTable sets no `skipGlobalErrorRedirect`, so an
  // uncaught 403 here would send the whole page to errorPage.noPermission.
  // Resolved to null instead, and the section is dropped: "we cannot show you
  // this" is not the same claim as "nobody was granted a role".
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['proposal-allocated-roles', projectUuid],
    queryFn: () =>
      getAllPages<UserRoleDetails>((page) =>
        projectsListUsersList({
          path: { uuid: projectUuid },
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ).catch(() => null),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  return (
    <AccordionCard
      // Named for the outcome rather than the mechanism: sitting above the
      // submission's own cards, the title is what marks the boundary between
      // what was asked for and what came of it.
      title={translate('Allocation outcome')}
      subtitle={
        usesCallVocabulary()
          ? translate('What this proposal produced once it was accepted.')
          : translate('What this request produced once it was approved.')
      }
      defaultOpen
    >
      <Row className="fs-6 mb-4">
        <Col sm={project ? 6 : 12}>
          <Field
            label={translate('Project')}
            labelCol={project ? 5 : 2}
            valueCol={project ? 7 : 10}
            value={
              // As children, not row.name: ProjectLink only truncates when it
              // has no children, and the generated name is long.
              <ProjectLink
                row={{
                  uuid: projectUuid,
                  name: project?.name || proposal.project_name,
                  customer_uuid: project?.customer_uuid,
                }}
              >
                {project?.name || proposal.project_name}
              </ProjectLink>
            }
          />
        </Col>
        {project && (
          <Col sm={6}>
            <Field
              label={translate('Organisation')}
              labelCol={5}
              valueCol={7}
              value={renderFieldOrDash(project.customer_name)}
            />
          </Col>
        )}
      </Row>

      <h6 className="text-secondary fw-bold mb-3">{translate('Resources:')}</h6>
      <Table<OutcomeRow>
        {...resources}
        {...tableChrome}
        verboseName={translate('requested resources')}
        columns={[
          {
            title: translate('Requested'),
            render: ({ row }) => <>{renderFieldOrDash(row.requestedName)}</>,
          },
          ...(awardRows?.length
            ? [
                {
                  title: translate('Awarded'),
                  render: ({ row }: { row: OutcomeRow }) => (
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {row.awardedName && <span>{row.awardedName}</span>}
                      {row.change && row.change !== 'unchanged' && (
                        <AwardChangeBadge change={row.change} />
                      )}
                    </div>
                  ),
                },
              ]
            : []),
          {
            // The created resource is named after the project, so its name is
            // identical on every row and says nothing; the state, linked
            // through, is all this column adds. A dash means nothing was made.
            title: translate('Allocated'),
            render: ({ row }) =>
              row.resource ? (
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
              ) : (
                <>{renderFieldOrDash(null)}</>
              ),
          },
        ]}
      />

      {!rolesLoading && roles && (
        <>
          <h6 className="text-secondary fw-bold mt-6 mb-3">
            {translate('Project access:')}
          </h6>
          <AllocatedTeamTable proposalUuid={proposal.uuid} roles={roles} />
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
export const AllocationOutcomeSection: FC<{
  proposal: Proposal;
  awardRows?: AwardComparisonRow[];
}> = ({ proposal, awardRows }) => {
  const projectUuid = getUUID(proposal.project);
  return projectUuid ? (
    <AllocationOutcome
      proposal={proposal}
      projectUuid={projectUuid}
      awardRows={awardRows}
    />
  ) : null;
};
