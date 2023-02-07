import { FunctionComponent } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { OfferingsListExpandableRow } from '@waldur/marketplace/offerings/expandable/OfferingsListExpandableRow';
import { Table, connectTable } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { useOfferingDropdownActions } from '../offerings/hooks';
import { OfferingActions } from '../offerings/OfferingActions';
import { OfferingsListTablePlaceholder } from '../offerings/OfferingsListTablePlaceholder';
import { OfferingStateCell } from '../offerings/OfferingStateCell';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { fetchProviderOfferings } from './api';

const OfferingNameColumn = ({ row }) => (
  <>
    <b>{row.name}</b>
    <div className="text-gray">{row.category_title}</div>
  </>
);

export const TableComponent: FunctionComponent<any> = (props) => {
  const dropdownActions = useOfferingDropdownActions();
  return (
    <Table
      {...props}
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={[
        {
          title: translate('Offering / Category'),
          render: OfferingNameColumn,
        },
        {
          title: translate('Type'),
          render: ({ row }) => getLabel(row.type),
        },
        {
          title: translate('Resources'),
          render: ({ row }) =>
            translate('{count} resources', { count: row.resources_count }),
        },
        {
          title: translate('Estimated cost'),
          render: ({ row }) =>
            defaultCurrency(row.billing_price_estimate?.total || 0),
        },
        {
          title: translate('State'),
          render: OfferingStateCell,
        },
      ]}
      verboseName={translate('Offerings')}
      expandableRow={OfferingsListExpandableRow}
      dropdownActions={dropdownActions}
      hoverableRow={OfferingActions}
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'ProviderOfferingsList',
  fetchData: fetchProviderOfferings,
  mapPropsToFilter: ({ provider }) => ({ provider_uuid: provider.uuid }),
};

const ProviderOfferingsComponent = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<any>;

export const ProviderOfferingsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingsComponent provider={provider} />;
};
