import {
  TrashIcon,
  FireIcon,
  ArrowCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { useMemo, FC } from 'react';
import { Badge as BsBadge, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  Resource,
  marketplaceResourceProjectsList,
  marketplaceResourceProjectsDestroy,
  ResourceProject,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
import {
  RESOURCE_PROJECTS_FILTER_FORM_ID,
  ResourceProjectsFilter,
} from './ResourceProjectsFilter';

const RestoreProjectDialog = lazyComponent(() =>
  import('./RestoreProjectDialog').then((module) => ({
    default: module.RestoreProjectDialog,
  })),
);

// In-flight states that warrant an inline spinner alongside the badge,
// so users can see at-a-glance which RPs are still being reconciled by
// the site-agent + downstream operator.
const PROGRESSING_STATES = new Set(['Creating', 'Updating', 'Terminating']);

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

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <BsBadge bg={variant}>{state}</BsBadge>
      {PROGRESSING_STATES.has(state) && (
        <Spinner
          animation="border"
          size="sm"
          role="status"
          aria-label={translate('In progress')}
        />
      )}
    </span>
  );
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

const DeleteProjectAction: FC<{
  row: ResourceProject;
  resourceUuid: string;
  refetch(): void;
}> = ({ row, resourceUuid, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourceProjectsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Project deleted.'),
    errorMessage: translate('Unable to delete project.'),
    refetch,
    // Refresh the parent resource so the quota header (e.g. "CPU 0/100")
    // reflects the freed allocation immediately instead of waiting for
    // the next page load.
    invalidateQueries: [{ queryKey: ['resource-details', resourceUuid] }],
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

const ForceDeleteProjectAction: FC<{
  row: ResourceProject;
  resourceUuid: string;
  refetch(): void;
}> = ({ row, resourceUuid, refetch }) => {
  const forceDeleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourceProjectsDestroy({
        path: { uuid: row.uuid },
        query: { force: true },
      }),
    successMessage: translate('Project permanently deleted.'),
    errorMessage: translate('Unable to permanently delete project.'),
    refetch,
    invalidateQueries: [{ queryKey: ['resource-details', resourceUuid] }],
    confirmation: {
      title: translate('Permanent deletion'),
      body: translate(
        'This will hard-delete project {name} from the database, bypassing soft delete. The action cannot be undone. Continue?',
        { name: <b>{row.name}</b> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Permanently delete')}
      action={() => forceDeleteMutation.mutate()}
      iconNode={<FireIcon weight="bold" />}
      className="text-danger"
      staff
      disabled={forceDeleteMutation.isPending}
    />
  );
};

const RestoreProjectAction: FC<{
  row: ResourceProject;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Recover')}
      action={() =>
        openDialog(RestoreProjectDialog, {
          resolve: { resource_project: row, refetch },
        })
      }
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
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
  const filterValues: { include_removed?: boolean } | undefined = useSelector(
    getFormValues(RESOURCE_PROJECTS_FILTER_FORM_ID),
  );

  const filter = useMemo(
    () => ({
      resource_uuid: resource.uuid,
      ...(filterValues?.include_removed && { include_removed: true }),
    }),
    [resource.uuid, filterValues?.include_removed],
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
      rowActions={({ row }) =>
        canManageProjects ? (
          <ActionsDropdown row={row} refetch={tableProps.fetch}>
            {row.is_removed ? (
              <RestoreProjectAction row={row} refetch={tableProps.fetch} />
            ) : (
              <>
                <ResourceProjectEditButton
                  row={row}
                  refetch={tableProps.fetch}
                  resource={resource}
                  offering={offering}
                  siblings={tableProps.rows as ResourceProject[]}
                />
                <DeleteProjectAction
                  row={row}
                  resourceUuid={resource.uuid}
                  refetch={tableProps.fetch}
                />
              </>
            )}
            {user.is_staff && (
              <ForceDeleteProjectAction
                row={row}
                resourceUuid={resource.uuid}
                refetch={tableProps.fetch}
              />
            )}
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
