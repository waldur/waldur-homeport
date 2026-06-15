import { FunctionComponent, useMemo } from 'react';
import {
  marketplaceProviderResourcesList,
  MarketplaceProviderResourcesListData,
  ProviderOfferingDetails as Offering,
  Resource,
  ResourceState,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  FILTER_OFFERING_RESOURCE,
  TABLE_OFFERING_RESOURCE,
} from '@/marketplace/details/constants';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { NON_TERMINATED_STATES } from '../resources/list/constants';
import { ProviderResourceActions } from '../resources/list/ProviderResourceActions';
import {
  getResourceAllListColumns,
  resourcesListRequiredFields,
} from '../resources/list/utils';

import { OfferingResourcesFilter } from './OfferingResourcesFilter';

interface OwnProps {
  offering: Offering;
}

interface FilterValues {
  state?: { value: ResourceState; label: string }[];
  include_terminated?: boolean;
}

export const OfferingResourcesList: FunctionComponent<OwnProps> = ({
  ...props
}) => {
  const values = useFilterValues(TABLE_OFFERING_RESOURCE);
  const filterValues: FilterValues = values;

  const filter = useMemo(() => {
    const filterObj: MarketplaceProviderResourcesListData['query'] = {};
    if (filterValues?.state) {
      filterObj.state = filterValues.state.map((option) => option.value);
      if (filterValues?.include_terminated) {
        filterObj.state = [...filterObj.state, 'Terminated'];
      }
    } else {
      if (!filterValues?.include_terminated) {
        filterObj.state = NON_TERMINATED_STATES;
      }
    }
    return {
      offering_uuid: props.offering.uuid,
      ...filterObj,
    };
  }, [props.offering, filterValues]);

  const tableProps = useTable({
    table: TABLE_OFFERING_RESOURCE,
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceProviderResourcesList),
    filter,
    queryField: 'query',
    mandatoryFields: resourcesListRequiredFields(false),
  });

  return (
    <Table<Resource>
      {...tableProps}
      formId={FILTER_OFFERING_RESOURCE}
      title={translate('Resources')}
      columns={getResourceAllListColumns(true, true)}
      hasOptionalColumns
      verboseName={translate('offering resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hasQuery={true}
      showPageSizeSelector={true}
      rowActions={({ row }) => (
        <ProviderResourceActions resource={row} refetch={tableProps.fetch} />
      )}
      filters={<OfferingResourcesFilter />}
    />
  );
};
