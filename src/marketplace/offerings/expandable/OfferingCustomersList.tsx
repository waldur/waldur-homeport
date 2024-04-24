import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { OFFERING_CUSTOMERS_LIST_TABLE_ID } from './constants';

interface OfferingCustomersListOwnProps {
  offeringUuid: string;
  uniqueFormId: string;
}

export const OfferingCustomersList: FunctionComponent<
  OfferingCustomersListOwnProps
> = (props) => {
  const table = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_TABLE_ID}-${props.offeringUuid}`,
    [props.offeringUuid],
  );

  const filterValues: any = useSelector(getFormValues(props.uniqueFormId));

  const filter = useMemo(
    () => ({
      accounting_is_running: filterValues?.accounting_is_running?.value,
    }),
    [filterValues],
  );

  const fetcher = useMemo(
    () =>
      createFetcher(
        `/marketplace-provider-offerings/${props.offeringUuid}/customers/`,
      ),
    [props.offeringUuid],
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
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      hasActionBar={false}
    />
  );
};
