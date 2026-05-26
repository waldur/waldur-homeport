import { FunctionComponent, useEffect, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  marketplaceProviderResourcesList,
  MarketplaceProviderResourcesListData,
  Resource,
  ResourceState,
} from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { translate } from '@/i18n';
import {
  FILTER_OFFERING_RESOURCE,
  TABLE_OFFERING_RESOURCE,
} from '@/marketplace/details/constants';
import { Offering } from '@/marketplace/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
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

const OfferingResourcesListTable: FunctionComponent<OwnProps> = (props) => {
  const { values } = useFormState();
  const filterValues: FilterValues = values;

  useEffect(() => {
    if (filterValues) {
      syncFiltersToURL(filterValues);
    }
  }, [filterValues]);

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

export const OfferingResourcesList: FunctionComponent<OwnProps> = (props) => {
  const initialValues = useMemo(() => getInitialValues(), []);

  return (
    <Form
      onSubmit={() => {}}
      subscription={{ values: true }}
      initialValues={initialValues}
    >
      {() => <OfferingResourcesListTable {...props} />}
    </Form>
  );
};
