import { TrashIcon } from '@phosphor-icons/react';
import { useMemo, FC } from 'react';
import { Badge as BsBadge } from 'react-bootstrap';
import {
  Resource,
  marketplaceResourceProjectsList,
  marketplaceResourceProjectsDestroy,
  ResourceProject,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { AddProjectButton } from './AddProjectDialog';
import { ResourceProjectEditButton } from './ResourceProjectEditButton';
import { ResourceProjectExpandable } from './ResourceProjectExpandable';

const StateLabel: FC<{ state: string }> = ({ state }) => {
  const variant =
    {
      Creating: 'info',
      OK: 'success',
      Erred: 'danger',
      Updating: 'warning',
      Terminating: 'warning',
      Terminated: 'secondary',
    }[state] || 'secondary';

  return <BsBadge bg={variant}>{state}</BsBadge>;
};

type ComponentLike = {
  type: string;
  name?: string;
  measured_unit?: string;
};

const LimitsDisplay: FC<{
  limits: Record<string, number> | null | undefined;
  components?: ComponentLike[];
}> = ({ limits, components }) => {
  if (!limits || Object.keys(limits).length === 0) return <>—</>;
  const byType = new Map<string, ComponentLike>();
  (components ?? []).forEach((c) => byType.set(c.type, c));
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {Object.entries(limits).map(([key, value]) => {
        const c = byType.get(key);
        const label = c?.name ?? key;
        const unit = c?.measured_unit ? ` ${c.measured_unit}` : '';
        return (
          <Badge
            key={key}
            variant="default"
            pill
            outline
            tooltip={c?.name ? `${c.name} (${key})` : key}
          >
            {label}: {value}
            {unit}
          </Badge>
        );
      })}
    </span>
  );
};

const DeleteProjectAction: FC<{
  row: ResourceProject;
  refetch(): void;
}> = ({ row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourceProjectsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Project deleted.'),
    errorMessage: translate('Unable to delete project.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete project {name}?',
        { name: <b>{row.name}</b> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={deleteMutation.isPending}
    />
  );
};

interface ResourceProjectsListProps {
  resource: Resource;
  offering?;
}

export const ResourceProjectsList: FC<ResourceProjectsListProps> = ({
  resource,
  offering,
}) => {
  const filter = useMemo(
    () => ({ resource_uuid: resource.uuid }),
    [resource.uuid],
  );

  const tableProps = useTable({
    table: 'resource-projects',
    fetchData: createFetcher(marketplaceResourceProjectsList),
    filter,
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
      hasQuery={true}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
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
      rowActions={({ row }) =>
        canManageProjects ? (
          <ActionsDropdown row={row} refetch={tableProps.fetch}>
            <ResourceProjectEditButton
              row={row}
              refetch={tableProps.fetch}
              resource={resource}
              offering={offering}
              siblings={tableProps.rows as ResourceProject[]}
            />
            <DeleteProjectAction row={row} refetch={tableProps.fetch} />
          </ActionsDropdown>
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
    />
  );
};
