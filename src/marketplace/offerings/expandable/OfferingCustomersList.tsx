import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceProviderOfferingsCustomersList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import {
  OFFERING_CUSTOMERS_LIST_FILTER,
  OFFERING_CUSTOMERS_LIST_TABLE_ID,
} from './constants';
import { OfferingCustomersListFilter } from './OfferingCustomersListFilter';

interface OfferingCustomersListOwnProps {
  offering: Offering;
}

export const OfferingCustomersList: FunctionComponent<
  OfferingCustomersListOwnProps
> = (props) => {
  const table = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_TABLE_ID}-${props.offering.uuid}`,
    [props.offering.uuid],
  );

  const uniqueFormId = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${props.offering.uuid}`,
    [props.offering],
  );

  const filterValues: any = useSelector(getFormValues(uniqueFormId));

  const filter = useMemo(
    () => ({
      accounting_is_running: filterValues?.accounting_is_running?.value,
    }),
    [filterValues],
  );

  const fetcher = useMemo(
    () =>
      createFetcher(marketplaceProviderOfferingsCustomersList, {
        path: { uuid: props.offering.uuid },
      }),
    [props.offering],
  );

  const tableProps = useTable({
    table,
    fetchData: fetcher,
    queryField: 'query',
    filter,
  });

  const columns = [
    {
      title: translate('Organization'),
      render: ({ row }) => <>{row.name}</>,
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <>{renderFieldOrDash(row.abbreviation)}</>,
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Organizations')}
      verboseName={translate('Organizations')}
      tableActions={<OfferingCustomersListFilter uniqueFormId={uniqueFormId} />}
      hasQuery={false}
      showPageSizeSelector={true}
    />
  );
};
