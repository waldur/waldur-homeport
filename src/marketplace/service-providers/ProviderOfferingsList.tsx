import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { useDestroyFilterOnLeave } from '@waldur/core/filters';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { createFetcher, Table } from '@waldur/table';
import { SLUG_COLUMN } from '@waldur/table/slug';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';

import { useOfferingDropdownActions } from '../offerings/hooks';
import { CreateOfferingButton } from '../offerings/list/CreateOfferingButton';
import { OfferingActions } from '../offerings/list/OfferingActions';
import { OfferingStateCell } from '../offerings/list/OfferingStateCell';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';
import { ServiceProvider } from '../types';

import { PROVIDER_OFFERINGS_FORM_ID } from './constants';
import { OfferingNameColumn } from './OfferingNameColumn';
import { ProviderOfferingsFilter } from './ProviderOfferingsFilter';
import { ResourcesCountColumn } from './ResourcesCountColumn';

interface ProviderOfferingsComponentProps {
  provider: ServiceProvider;
  extraTableProps?: Partial<TableProps>;
}

const mapStateToFilter = createSelector(
  getFormValues(PROVIDER_OFFERINGS_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.offering_type) {
      result.type = filters.offering_type.value;
    }
    return result;
  },
);

export const ProviderOfferingsComponent: FC<
  ProviderOfferingsComponentProps
> = ({ provider, extraTableProps = {} }) => {
  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    fetchData: createFetcher(
      `marketplace-service-providers/${provider.uuid}/offerings`,
    ),
    filter,
    queryField: 'name',
  });
  const dropdownActions = useOfferingDropdownActions();

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Offering / Category'),
          render: OfferingNameColumn,
          id: 'name',
          keys: ['name', 'backend_id', 'uuid', 'category_title'],
        },
        {
          title: translate('Type'),
          render: ({ row }) => getLabel(row.type),
          filter: 'offering_type',
          id: 'type',
          keys: ['type'],
        },
        {
          title: translate('Resources'),
          render: ResourcesCountColumn,
          id: 'resources_count',
          keys: ['resources_count'],
        },
        {
          title: translate('Estimated cost'),
          render: ({ row }) =>
            defaultCurrency(row.billing_price_estimate?.total || 0),
          id: 'billing_price_estimate',
          keys: ['billing_price_estimate'],
        },
        {
          title: translate('State'),
          render: OfferingStateCell,
          filter: 'state',
          id: 'state',
          keys: ['state'],
        },
        SLUG_COLUMN,
      ]}
      verboseName={translate('Offerings')}
      dropdownActions={dropdownActions}
      actions={<CreateOfferingButton fetch={tableProps.fetch} />}
      hoverableRow={(row) => (
        <OfferingActions row={row.row} refetch={tableProps.fetch} />
      )}
      {...extraTableProps}
      filters={<ProviderOfferingsFilter />}
      hasQuery={true}
      hasOptionalColumns
    />
  );
};

export const ProviderOfferingsList = ({ provider }) => {
  useDestroyFilterOnLeave(PROVIDER_OFFERINGS_FORM_ID);

  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return (
    <ProviderOfferingsComponent
      provider={provider}
      extraTableProps={{
        filters: <ProviderOfferingsFilter />,
      }}
    />
  );
};
