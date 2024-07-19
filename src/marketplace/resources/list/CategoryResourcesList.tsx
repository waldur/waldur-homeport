import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { CategoryColumn } from '@waldur/marketplace/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ResourceImportButton } from '../import/ResourceImportButton';

import { AllResourcesFilter } from './AllResourcesFilter';
import { CategoryColumnField } from './CategoryColumnField';
import { CreateResourceButton } from './CreateResourceButton';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';
import { NON_TERMINATED_STATES } from './ResourceStateFilter';
import { resourcesListRequiredFields } from './utils';

interface OwnProps {
  category_uuid: string;
  category_title: string;
  columns: CategoryColumn[];
  standalone;
}

export const CategoryResourcesList: FunctionComponent<OwnProps> = (
  ownProps,
) => {
  const filterValues: any = useSelector(getFormValues('AllResourcesFilter'));

  const filter = useMemo(() => {
    const filter: Record<string, any> = {};
    if (ownProps.category_uuid) {
      filter.category_uuid = ownProps.category_uuid;
    }
    if (filterValues?.offering) {
      filter.offering_uuid = filterValues.offering.uuid;
    }
    if (filterValues?.project) {
      filter.project_uuid = filterValues.project.uuid;
    }
    if (filterValues?.runtime_state) {
      filter.runtime_state = filterValues.runtime_state.value;
    }
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
      if (filterValues.include_terminated) {
        filter.state = [...filter.state, 'Terminated'];
      }
    } else {
      if (!filterValues?.include_terminated) {
        filter.state = NON_TERMINATED_STATES.map((option) => option.value);
      }
    }
    if (filterValues?.organization) {
      filter.customer_uuid = filterValues.organization.uuid;
    }
    filter.field = resourcesListRequiredFields();
    return filter;
  }, [filterValues, ownProps.category_uuid]);

  const props = useTable({
    table: `UserResourcesList-${ownProps.category_uuid}`,
    fetchData: createFetcher('marketplace-resources'),
    filter,
    queryField: 'query',
  });
  const columns: any[] = [
    {
      title: translate('Name'),
      render: ResourceNameField,
      orderField: 'name',
    },
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
      filter: 'offering',
    },
  ];

  ownProps.columns.map((column: CategoryColumn) => {
    columns.push({
      title: column.title,
      render: ({ row }) => CategoryColumnField({ row, column }),
    });
  });
  columns.push({
    title: translate('Organization'),
    render: ({ row }) => <>{row.customer_name}</>,
    filter: 'organization',
  });
  columns.push({
    title: translate('Project'),
    render: ({ row }) => <>{row.project_name}</>,
    filter: 'project',
  });
  columns.push(
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} />,
      filter: 'state',
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
  );

  const tableActions = (
    <>
      {isFeatureVisible(MarketplaceFeatures.import_resources) && (
        <ResourceImportButton category_uuid={ownProps.category_uuid} />
      )}
      <CreateResourceButton category_uuid={ownProps.category_uuid} />
    </>
  );

  return (
    <Table
      {...props}
      title={ownProps.category_title}
      columns={columns}
      verboseName={translate('Resources')}
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      actions={tableActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
      standalone={ownProps.standalone}
      filters={<AllResourcesFilter category_uuid={ownProps.category_uuid} />}
    />
  );
};
