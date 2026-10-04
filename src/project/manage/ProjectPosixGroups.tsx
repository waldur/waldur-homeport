import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Project, ProjectPosixGroup } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { ProjectGroupMembers } from '@/marketplace/service-providers/project-groups/ProjectGroupMembers';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  isProviderGroup,
  ProviderGroupSummary,
  RollupError,
} from './ProviderGroupSummary';
import {
  fetchProjectPosixGroups,
  useProjectPosixGroups,
} from './useProjectPosixGroups';

interface ProjectPosixGroupsProps {
  project: Project;
}

// Both tables read the one rollup response, each keeping its own kinds.
const useRollupTable = (
  table: string,
  projectUuid: string,
  keep: (row: ProjectPosixGroup) => boolean,
) => {
  const queryClient = useQueryClient();
  const fetchData = useCallback(
    () =>
      fetchProjectPosixGroups(queryClient, projectUuid).then((rows) => {
        const kept = (rows ?? []).filter(keep);
        return { rows: kept, resultCount: kept.length };
      }),
    [queryClient, projectUuid, keep],
  );
  return useTable<ProjectPosixGroup>({
    table: `${table}-${projectUuid}`,
    fetchData,
  });
};

const keepProviderGroups = (row: ProjectPosixGroup) => isProviderGroup(row);
const keepOfferingGroups = (row: ProjectPosixGroup) => !isProviderGroup(row);

// Two lists in one panel: each keeps its heading, without the toolbar.
const SECTION_TABLE_PROPS = {
  hideIfEmpty: true,
  hideRefresh: true,
  placeholderHasRetry: false,
  className: 'mt-5',
  headerClassName: 'min-h-40px py-0',
  titleClassName: 'h4 fw-bold text-gray-700',
  minHeight: 'auto',
} as const;

const ProviderGroupMembers = ({ row }: { row: ProjectPosixGroup }) => (
  <ProjectGroupMembers members={row.members} />
);

/** The project's one group at each service provider. */
const ProviderGroupsTable: FC<{ projectUuid: string }> = ({ projectUuid }) => {
  const tableProps = useRollupTable(
    'project-provider-groups',
    projectUuid,
    keepProviderGroups,
  );
  const columns = useMemo(
    () => [
      {
        title: translate('Group name'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          row.group_name ? (
            <code>{row.group_name}</code>
          ) : (
            renderFieldOrDash(null)
          ),
        copyField: (row: ProjectPosixGroup) => row.group_name ?? '',
      },
      {
        title: translate('GID'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          row.gid == null ? (
            <span className="text-muted">{translate('Not assigned yet')}</span>
          ) : (
            <code>{row.gid}</code>
          ),
        copyField: (row: ProjectPosixGroup) =>
          row.gid == null ? '' : String(row.gid),
      },
      {
        title: translate('Service provider'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          renderFieldOrDash(row.provider_name),
      },
      {
        title: translate('Offerings'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          renderFieldOrDash(
            (row.offerings ?? []).map((offering) => offering.name).join(', '),
          ),
      },
      {
        title: translate('Members'),
        // Zero members is a count, not a missing value.
        render: ({ row }: { row: ProjectPosixGroup }) => {
          const count = row.member_count ?? row.members?.length;
          return count == null ? renderFieldOrDash(null) : <>{count}</>;
        },
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          row.in_use ? (
            <Badge variant="success" tone="light">
              {translate('In use')}
            </Badge>
          ) : (
            <Badge variant="neutral" tone="light">
              {translate('Not in use')}
            </Badge>
          ),
      },
    ],
    [],
  );
  return (
    <Table<ProjectPosixGroup>
      {...tableProps}
      columns={columns}
      title={translate('Groups at service providers')}
      verboseName={translate('groups at service providers')}
      expandableRow={ProviderGroupMembers}
      {...SECTION_TABLE_PROPS}
    />
  );
};

/** Groups held per offering: project groups and resource / role groups. */
const OfferingGroupsTable: FC<{ projectUuid: string }> = ({ projectUuid }) => {
  const tableProps = useRollupTable(
    'project-offering-groups',
    projectUuid,
    keepOfferingGroups,
  );
  const columns = useMemo(
    () => [
      {
        title: translate('GID'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          row.gid == null ? renderFieldOrDash(null) : <code>{row.gid}</code>,
        copyField: (row: ProjectPosixGroup) =>
          row.gid == null ? '' : String(row.gid),
      },
      {
        title: translate('Type'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          row.kind === 'project_group'
            ? translate('Project group')
            : translate('Role group'),
      },
      {
        title: translate('Offering'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          renderFieldOrDash(row.offering_name),
      },
      {
        title: translate('Service provider'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          renderFieldOrDash(row.provider_name),
      },
      {
        title: translate('Role / scope'),
        render: ({ row }: { row: ProjectPosixGroup }) =>
          renderFieldOrDash(
            row.kind === 'role_group'
              ? `${row.role} · ${row.scope_type}${
                  row.scope_name ? ' ' + row.scope_name : ''
                }`
              : null,
          ),
      },
    ],
    [],
  );
  return (
    <Table<ProjectPosixGroup>
      {...tableProps}
      columns={columns}
      title={translate('Groups per offering')}
      verboseName={translate('groups per offering')}
      {...SECTION_TABLE_PROPS}
    />
  );
};

export const ProjectPosixGroups: FC<ProjectPosixGroupsProps> = ({
  project,
}) => {
  const { isLoading, error, refetch } = useProjectPosixGroups(project.uuid);
  return (
    <Panel title={translate('POSIX identities')} cardBordered>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <RollupError retry={() => refetch()} />
      ) : (
        <ProjectPosixGroupsLists projectUuid={project.uuid} />
      )}
    </Panel>
  );
};

const ProjectPosixGroupsLists: FC<{ projectUuid: string }> = ({
  projectUuid,
}) => (
  <>
    <p className="text-muted">
      {translate(
        'Group IDs (GIDs) assigned to this project: its one group at each service provider, and the groups held per offering.',
      )}
    </p>
    <ProviderGroupSummary projectUuid={projectUuid} />
    <ProviderGroupsTable projectUuid={projectUuid} />
    <OfferingGroupsTable projectUuid={projectUuid} />
  </>
);
