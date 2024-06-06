import { PlusCircle } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { MARKETPLACE_LANDING_FILTER_FORM } from '@waldur/marketplace/constants';
import { setMarketplaceFilter } from '@waldur/marketplace/landing/filter/store/actions';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Table } from '@waldur/table';
import { ActionButton } from '@waldur/table/ActionButton';
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
        },
        {
          title: translate('Category'),
          render: ({ row }: FieldProps) => <>{row.category_title}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }: FieldProps) => <>{row.offering_name}</>,
        },
        ...(props.hasCustomerColumn
          ? [
              {
                title: translate('Organization'),
                render: ({ row }) => <>{row.customer_name}</>,
              },
            ]
          : []),
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
