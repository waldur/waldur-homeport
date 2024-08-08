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
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';

import { ResourceStateField } from '../resources/list/ResourceStateField';
import { NON_TERMINATED_STATES } from '../resources/list/ResourceStateFilter';

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
    const filter: Record<string, string | string[]> = {};
    if (filterValues?.state) {
      filter.state = filterValues.state.map((option) => option.value);
      if (filterValues?.include_terminated) {
        filter.state = [...filter.state, 'Terminated'];
      }
    } else {
      if (!filterValues?.include_terminated) {
        filter.state = NON_TERMINATED_STATES.map((option) => option.value);
      }
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
    queryField: 'query',
  });
  const columns: Column[] = [
    {
      title: translate('Name'),
      render: PublicResourceLink,
      orderField: 'name',
      export: 'name',
    },
    {
      visible: false,
      title: translate('Resource UUID'),
      render: null,
      export: 'uuid',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      export: 'customer_name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
      export: 'project_name',
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
      export: 'plan_name',
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: false,
    },
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} outline pill />,
      filter: 'state',
      export: 'state',
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
      rowActions={PublicResourceActions}
      filters={<OfferingResourcesFilter />}
    />
  );
};
