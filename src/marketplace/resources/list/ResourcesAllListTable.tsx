import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Table } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';

import { Resource } from '../types';

import { EmptyResourcesListPlaceholder } from './EmptyResourcesListPlaceholder';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ProjectResourcesAllFilter } from './ProjectResourcesAllFilter';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface FieldProps {
  row: Resource;
}

interface ResourcesAllListTableProps extends TableProps {
  hasProjectColumn?: boolean;
}

export const ResourcesAllListTable: FC<ResourcesAllListTableProps> = (
  props,
) => {
  return (
    <Table
      {...props}
      filters={<ProjectResourcesAllFilter />}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Category'),
          render: ({ row }: FieldProps) => <>{row.category_title}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }: FieldProps) => <>{row.offering_name}</>,
        },
        ...(props.hasProjectColumn
          ? [
              {
                title: translate('Project'),
                render: ({ row }) => <>{row.project_name}</>,
              },
            ]
          : []),
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceStateField resource={row} />,
        },
      ]}
      title={translate('Resources')}
      verboseName={translate('Resources')}
      placeholderComponent={<EmptyResourcesListPlaceholder />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
      actions={
        <Link state="public.marketplace-landing">
          <Button variant="primary">
            <span className="svg-icon svg-icon-2">
              <PlusCircle />
            </span>
            {translate('Add resource')}
          </Button>
        </Link>
      }
    />
  );
};
