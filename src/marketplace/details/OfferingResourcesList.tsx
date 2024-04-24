import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  FILTER_OFFERING_RESOURCE,
  TABLE_OFFERING_RESOURCE,
} from '@waldur/marketplace/details/constants';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { PublicResourceActions } from '@waldur/marketplace/resources/usage/PublicResourceActions';
import { Offering } from '@waldur/marketplace/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ResourceStateField } from '../resources/list/ResourceStateField';

import { OfferingResourcesFilter } from './OfferingResourcesFilter';

interface OwnProps {
  offering: Offering;
}

export const OfferingResourcesList: FunctionComponent<OwnProps> = (
  ownProps,
) => {
  const filterValues: any = useSelector(
    getFormValues(FILTER_OFFERING_RESOURCE),
  );
  const filter = useMemo(() => {
    const filter: Record<string, string> = {};
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
    }
    return {
      offering_uuid: ownProps.offering.uuid,
      ...filter,
    };
  }, [ownProps.offering, filterValues]);
  const tableProps = useTable({
    table: TABLE_OFFERING_RESOURCE,
    fetchData: createFetcher('marketplace-resources'),
    filter,
    exportRow,
    exportFields,
    queryField: 'query',
  });
  const columns = [
    {
      title: translate('Name'),
      render: PublicResourceLink,
      orderField: 'name',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} />,
    },
  ];

  return (
    <Table
      {...tableProps}
      title={translate('Resources')}
      columns={columns}
      verboseName={translate('offering resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hasQuery={true}
      showPageSizeSelector={true}
      hoverableRow={PublicResourceActions}
      filters={<OfferingResourcesFilter />}
    />
  );
};

const exportRow = (row) => [
  row.name,
  row.uuid,
  row.customer_name,
  row.project_name,
  row.plan_name,
  row.state,
];

const exportFields = [
  'Name',
  'Resource UUID',
  'Client organization',
  'Client project',
  'Plan',
  'State',
];
