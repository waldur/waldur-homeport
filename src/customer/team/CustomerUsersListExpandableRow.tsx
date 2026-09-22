import { FunctionComponent, useEffect } from 'react';
import { CustomerUser } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { RoleField } from '@/user/affiliations/RoleField';

import { AddProjectUserButton } from './AddProjectUserButton';
import { DeleteProjectUserButton } from './DeleteProjectUserButton';
import { EditProjectUserButton } from './EditProjectUserButton';

type CustomerProjectGrant = CustomerUser['projects'][number];

export type ProjectGrantRow = CustomerProjectGrant & {
  uuid: string;
  project_uuid: string;
};

// Composite uuid (project uuid + role name) survives the table's entity-dict
// de-dup in `transformRows` (src/table/utils.tsx); without it, two grants on
// the same project with different roles collapse to one row. role_name is the
// discriminator because NestedProjectPermission has no role_uuid.
export const toProjectGrantRow = (
  grant: CustomerProjectGrant,
): ProjectGrantRow => ({
  ...grant,
  project_uuid: grant.uuid ?? '',
  uuid: `${grant.uuid ?? ''}-${grant.role_name ?? ''}`,
});

export const RowActions = ({
  row,
  refetch,
  project,
}: {
  row: CustomerUser;
  refetch;
  project: ProjectGrantRow;
}) => {
  // The row's uuid is the composite key, so an action building an API path
  // from it would hit /api/projects/<uuid>-PROJECT.ADMIN/ and 404.
  const grant = { ...project, uuid: project.project_uuid };

  return (
    <ActionsDropdownComponent>
      <EditProjectUserButton customer={row} project={grant} refetch={refetch} />

      <DeleteProjectUserButton
        customer={row}
        project={grant}
        refetch={refetch}
      />
    </ActionsDropdownComponent>
  );
};

export const CustomerUsersListExpandableRow: FunctionComponent<{
  row: CustomerUser;
  refetch;
}> = ({ row, refetch }) => {
  // `project_uuid` is what the dashboard link below needs.
  const tableProps = useTable<ProjectGrantRow>({
    table: 'CustomerUsersListExpandableRow-' + row.uuid,
    fetchData: createClientPaginatedFetcher(
      (row.projects ?? []).map(toProjectGrantRow),
    ),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [row.projects]);

  return !row.projects || row.projects.length === 0 ? (
    <div className="text-center py-4">
      <p>{translate('No projects are assigned to this user.')}</p>
      <AddProjectUserButton customer={row} refetch={refetch} />
    </div>
  ) : (
    <ExpandableContainer hasMultiSelect>
      <Table<ProjectGrantRow>
        {...tableProps}
        rowKey="uuid"
        columns={[
          {
            title: translate('Project name'),
            render: ({ row: project }) => (
              <Link
                state="project.dashboard"
                params={{ uuid: project.project_uuid }}
                label={project.name}
              />
            ),
          },
          {
            title: translate('Role'),
            render: ({ row: project }) => <RoleField row={project} />,
          },
          {
            title: translate('Expiration time'),
            render: ({ row: project }) =>
              project.expiration_time
                ? formatDateTime(project.expiration_time)
                : renderFieldOrDash(null),
          },
        ]}
        rowActions={({ row: project }) => (
          <RowActions row={row} refetch={refetch} project={project} />
        )}
        verboseName={translate('Project grants')}
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
