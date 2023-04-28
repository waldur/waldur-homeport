import { FC } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { OfferingsListExpandableRow } from '@waldur/marketplace/offerings/expandable/OfferingsListExpandableRow';
import { Table, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';

import { useOfferingDropdownActions } from '../offerings/hooks';
import { OfferingActions } from '../offerings/OfferingActions';
import { OfferingsListTablePlaceholder } from '../offerings/OfferingsListTablePlaceholder';
import { OfferingStateCell } from '../offerings/OfferingStateCell';
import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';
import { ServiceProvider } from '../types';

import { ResourcesCountColumn } from './ResourcesCountColumn';

const OfferingNameColumn = ({ row }) => (
  <>
    <Link
      state="public.marketplace-public-offering"
      params={{ uuid: row.uuid }}
      className="fw-bolder"
    >
      {row.name}
    </Link>
    <div className="text-gray">{row.category_title}</div>
  </>
);

interface ProviderOfferingsComponentProps {
  provider: ServiceProvider;
  extraTableProps?: Partial<TableProps>;
}

export const ProviderOfferingsComponent: FC<ProviderOfferingsComponentProps> =
  ({ provider, extraTableProps = {} }) => {
    const tableProps = useTable({
      table: 'ProviderOfferingsList',
      fetchData: createFetcher(
        `marketplace-service-providers/${provider.uuid}/offerings`,
      ),
    });
    const dropdownActions = useOfferingDropdownActions();
    return (
      <Table
        {...tableProps}
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
            render: ResourcesCountColumn,
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
        {...extraTableProps}
      />
    );
  };

export const ProviderOfferingsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderOfferingsComponent provider={provider} />;
};
