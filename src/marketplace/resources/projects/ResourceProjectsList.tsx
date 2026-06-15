import { useMemo, FC } from 'react';
import {
  Resource,
  marketplaceResourceProjectsList,
  ResourceProject,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { AddProjectButton } from './AddProjectDialog';
import { LimitsDisplay } from './LimitsDisplay';
import { ResourceProjectActions } from './ResourceProjectActions';
import { ResourceProjectExpandable } from './ResourceProjectExpandable';
import {
  RESOURCE_PROJECTS_FILTER_FORM_ID,
  ResourceProjectsFilter,
} from './ResourceProjectsFilter';
import { StateLabel } from './StateLabel';

const NameCell: FC<{ row: ResourceProject }> = ({ row }) =>
  row.is_removed ? (
    <span className="text-muted">
      <s>{row.name}</s>{' '}
      <Badge variant="danger" pill outline className="fs-8 ms-1">
        {translate('Removed')}
      </Badge>
    </span>
  ) : (
    <>{row.name}</>
  );

interface ResourceProjectsListProps {
  resource: Resource;
  offering?;
}

export const ResourceProjectsList: FC<ResourceProjectsListProps> = ({
  resource,
  offering,
}) => {
  const values = useFilterValues('resource-projects');
  const filterValues = values;

  const filter = useMemo(
    () => ({
      resource_uuid: resource.uuid,
      ...(filterValues?.include_removed && { include_removed: true }),
    }),
    [resource.uuid, filterValues?.include_removed],
  );

  const tableProps = useTable({
    table: 'resource-projects',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceResourceProjectsList),
    filter,
    initialFilters: { include_removed: false },
    queryField: 'name',
  });

  const user = useUser();
  const canManageProjects = hasPermission(user, {
    permission: PermissionEnum.UPDATE_RESOURCE,
    projectId: resource.project_uuid,
    customerId: resource.customer_uuid,
  });

  return (
    <Table
      {...tableProps}
      title={translate('Resource projects')}
      filters={<ResourceProjectsFilter />}
      hasQuery={true}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <NameCell row={row} />,
          copyField: (row) => row.name,
          keys: ['name'],
        },
        {
          title: translate('State'),
          render: ({ row }) => <StateLabel state={row.state} />,
          keys: ['state'],
        },
        {
          title: translate('Limits'),
          render: ({ row }) => (
            <LimitsDisplay
              limits={row.limits}
              components={offering?.components}
            />
          ),
          keys: ['limits'],
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
          keys: ['description'],
        },
      ]}
      expandableRow={({ row }) => (
        <ResourceProjectExpandable
          row={row}
          resource={resource}
          offering={offering}
        />
      )}
      isRowExpandable={(row) => !row.is_removed}
      rowActions={({ row }) =>
        canManageProjects ? (
          <ResourceProjectActions
            row={row}
            resource={resource}
            offering={offering}
            refetch={tableProps.fetch}
            siblings={tableProps.rows as ResourceProject[]}
          />
        ) : null
      }
      tableActions={
        canManageProjects ? (
          <AddProjectButton
            resource={resource}
            offering={offering}
            siblings={tableProps.rows as ResourceProject[]}
            refetch={tableProps.fetch}
          />
        ) : null
      }
      formId={RESOURCE_PROJECTS_FILTER_FORM_ID}
    />
  );
};
