import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { MARKETPLACE_LANDING_FILTER_FORM } from '@waldur/marketplace/constants';
import { setMarketplaceFilter } from '@waldur/marketplace/landing/filter/store/actions';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Table } from '@waldur/table';
import { ActionButton } from '@waldur/table/ActionButton';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { TableProps } from '@waldur/table/Table';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { Resource } from '../types';

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
  hasCustomerColumn?: boolean;
  context?: 'organization' | 'project';
}

const CreateResourceButton = ({
  context,
}: Pick<ResourcesAllListTableProps, 'context'>) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const callback = useCallback(() => {
    // Set organization filter to offerings
    dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, 'organization', customer));
    dispatch(
      setMarketplaceFilter({
        label: translate('Organization'),
        name: 'organization',
        value: customer,
        getValueLabel: (value) => value?.name,
      }),
    );
    if (context === 'project') {
      dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, 'project', project));
      dispatch(
        setMarketplaceFilter({
          label: translate('Project'),
          name: 'project',
          value: project,
          getValueLabel: (value) => value?.name,
        }),
      );
    } else {
      // Remove project filter if exist
      dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, 'project', undefined));
      dispatch(setMarketplaceFilter({ name: 'project', value: null }));
    }
    router.stateService.go('public.marketplace-landing');
  }, [dispatch, router, context, customer, project]);
  return (
    <ActionButton
      action={callback}
      iconNode={<PlusCircle />}
      title={translate('Add resource')}
      variant="primary"
    />
  );
};

export const ResourcesAllListTable: FC<ResourcesAllListTableProps> = (
  props,
) => {
  return (
    <Table
      {...props}
      filters={
        <ProjectResourcesAllFilter
          hasProjectFilter={props.hasProjectColumn}
          hasCustomerFilter={props.hasCustomerColumn}
        />
      }
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
          id: 'name',
          keys: ['name'],
          export: (row) => row.name || row.offering_name, // render as ResourceNameField label
        },
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          id: 'uuid',
          keys: ['uuid'],
          optional: true,
        },
        {
          title: translate('Category'),
          render: ({ row }: FieldProps) => <>{row.category_title}</>,
          filter: 'category',
          id: 'category',
          keys: ['category_title'],
          export: (row) => row.category_title,
        },
        {
          title: translate('Offering'),
          render: ({ row }: FieldProps) => <>{row.offering_name}</>,
          filter: 'offering',
          id: 'offering',
          keys: ['offering_name'],
          export: (row) => row.offering_name,
        },
        {
          title: translate('Plan'),
          render: ({ row }: FieldProps) => <>{row.plan_name || 'N/A'}</>,
          id: 'plan',
          keys: ['plan_name'],
          optional: true,
        },
        ...(props.hasCustomerColumn
          ? [
              {
                title: translate('Organization'),
                render: ({ row }) => <>{row.customer_name}</>,
                filter: 'organization',
                id: 'organization',
                keys: ['customer_name'],
                export: (row) => row.customer_name,
              },
            ]
          : []),
        ...(props.hasProjectColumn
          ? [
              {
                title: translate('Project'),
                render: ({ row }) => <>{row.project_name}</>,
                filter: 'project',
                id: 'project',
                keys: ['project_name'],
                export: (row) => row.project_name,
              },
            ]
          : []),
        {
          title: translate('Project end date'),
          render: ({ row }) => <>{row.project_end_date || 'N/A'}</>,
          id: 'project_end_date',
          keys: ['project_end_date'],
          optional: true,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
          id: 'created',
          keys: ['created'],
          export: (row) => formatDateTime(row.created),
        },
        ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE && {
          title: translate('Termination date'),
          render: ({ row }) => <>{row.end_date || 'N/A'}</>,
          id: 'end_date',
          keys: ['end_date'],
          optional: true,
          export: (row) => row.end_date,
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} outline pill />
          ),
          filter: 'state',
          id: 'state',
          keys: ['state', 'backend_metadata'],
          export: (row) =>
            row.backend_metadata?.runtime_state ||
            row.backend_metadata?.state ||
            row.state,
        },
        SLUG_COLUMN,
      ]}
      hasOptionalColumns
      title={translate('Resources')}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      hasQuery={true}
      enableExport
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
      actions={
        props.context ? (
          <CreateResourceButton context={props.context} />
        ) : (
          <Link state="public.marketplace-landing">
            <Button variant="primary">
              <span className="svg-icon svg-icon-2">
                <PlusCircle />
              </span>
              {translate('Add resource')}
            </Button>
          </Link>
        )
      }
    />
  );
};
