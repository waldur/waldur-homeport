import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceProviderOfferingsCustomersList } from 'waldur-js-client';

import {
  AccountingRunningField,
  getOptions,
} from '@/customer/list/AccountingRunningField';
import { EstimatedCostField } from '@/customer/list/EstimatedCostField';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CustomerContactColumn } from '../../service-providers/CustomerContactColumn';
import { CustomerNameColumn } from '../../service-providers/CustomerNameColumn';

const OfferingMembersColumn = ({ row }) => {
  if (!row.users || !Array.isArray(row.users)) {
    return <>{row.users_count || 0}</>;
  }

  return row.users_count === 0 ? (
    <>{translate('No active members')}</>
  ) : (
    <>
      {row.users_count} {translate('members')}
    </>
  );
};

interface OfferingCustomerOrganizationsTableProps {
  offering: Offering;
  tabs: any[];
}

const OrganizationsTableBody: FunctionComponent<
  OfferingCustomerOrganizationsTableProps
> = ({ offering, tabs }) => {
  const { values } = useFormState();
  const accounting_is_running = values?.accounting_is_running?.value;

  const organizationsFilter = useMemo(
    () => ({
      accounting_is_running,
    }),
    [accounting_is_running],
  );

  const organizationsTableProps = useTable({
    table: `offering-organizations-${offering.uuid}`,
    fetchData: createFetcher(marketplaceProviderOfferingsCustomersList, {
      path: { uuid: offering.uuid },
    }),
    filter: organizationsFilter,
    queryField: 'query',
  });

  return (
    <Table
      {...organizationsTableProps}
      columns={[
        {
          title: translate('Organization'),
          render: CustomerNameColumn,
          copyField: (row) => row.name,
        },
        {
          title: translate('Abbreviation'),
          render: ({ row }) => <>{renderFieldOrDash(row.abbreviation)}</>,
        },
        {
          title: translate('Contact'),
          render: CustomerContactColumn,
        },
        {
          title: translate('Members'),
          render: OfferingMembersColumn,
        },
        {
          title: translate('Estimated cost'),
          render: EstimatedCostField,
        },
      ]}
      tabs={tabs}
      verboseName={translate('Organizations')}
      showPageSizeSelector={true}
      tableActions={
        <div className="form-inline min-w-200px">
          <AccountingRunningField />
        </div>
      }
      hasQuery={false}
    />
  );
};

export const OfferingCustomerOrganizationsTable: FunctionComponent<
  OfferingCustomerOrganizationsTableProps
> = (props) => {
  const initialValues = useMemo(
    () => ({
      accounting_is_running: getOptions()[0],
    }),
    [],
  );

  return (
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <OrganizationsTableBody {...props} />
        </form>
      )}
    />
  );
};
