import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceProviderOfferingsCustomersList,
  marketplaceProviderOfferingsListCustomerProjectsList,
  marketplaceProviderOfferingsListUsersList,
} from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { EstimatedCostField } from '@waldur/customer/list/EstimatedCostField';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { ProjectsListTable } from '@waldur/project/ProjectsList';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CustomerContactColumn } from '../../service-providers/CustomerContactColumn';
import { CustomerNameColumn } from '../../service-providers/CustomerNameColumn';
import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';
import { OfferingCustomersListFilter } from '../expandable/OfferingCustomersListFilter';

interface OfferingCustomersProps {
  offering: Offering;
}

const CUSTOMER_TABS = [
  {
    key: 'organizations',
    title: translate('Organizations'),
  },
  {
    key: 'projects',
    title: translate('Projects'),
  },
  {
    key: 'users',
    title: translate('Users'),
  },
];

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

const UserNameColumn = ({ row }) => (
  <>
    <Link
      state="marketplace-provider-user-manage"
      params={{ user_uuid: row.uuid }}
      label={renderFieldOrDash(row.full_name)}
      className="fw-bold"
    />
    {row.organization ? (
      <p className="text-muted mb-0">{row.organization}</p>
    ) : null}
  </>
);

export const OfferingCustomers = ({ offering }: OfferingCustomersProps) => {
  const { params } = useCurrentStateAndParams();
  const activeTab = params.customerTab || 'organizations';

  const uniqueFormId = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${offering.uuid}`,
    [offering.uuid],
  );

  const filterValues: any = useSelector(getFormValues(uniqueFormId));

  const organizationsFilter = useMemo(
    () => ({
      accounting_is_running: filterValues?.accounting_is_running?.value,
    }),
    [filterValues],
  );

  const organizationsTableProps = useTable({
    table: `offering-organizations-${offering.uuid}`,
    fetchData: createFetcher(marketplaceProviderOfferingsCustomersList, {
      path: { uuid: offering.uuid },
    }),
    filter: organizationsFilter,
    queryField: 'query',
  });

  const projectsTableProps = useTable({
    table: `offering-projects-${offering.uuid}`,
    fetchData: createFetcher(
      marketplaceProviderOfferingsListCustomerProjectsList,
      {
        path: { uuid: offering.uuid },
      },
    ),
    queryField: 'query',
  });

  const usersTableProps = useTable({
    table: `offering-users-${offering.uuid}`,
    fetchData: createFetcher(marketplaceProviderOfferingsListUsersList, {
      path: { uuid: offering.uuid },
    }),
    queryField: 'query',
  });

  const tabsWithNavigation = CUSTOMER_TABS.map((tab) => ({
    ...tab,
    state: 'marketplace-offering-details',
    params: {
      offering_uuid: offering.uuid,
      tab: 'customers',
      customerTab: tab.key,
    },
  }));

  if (activeTab === 'projects') {
    return (
      <ProjectsListTable
        {...projectsTableProps}
        tabs={tabsWithNavigation}
        tableActions={null}
        rowActions={null}
      />
    );
  }

  if (activeTab === 'users') {
    return (
      <Table
        {...usersTableProps}
        columns={[
          {
            title: translate('User'),
            render: UserNameColumn,
            ellipsis: true,
          },
          {
            title: translate('Contact'),
            render: CustomerContactColumn,
            ellipsis: true,
          },
        ]}
        tabs={tabsWithNavigation}
        showPageSizeSelector={true}
        verboseName={translate('users')}
        hasQuery={true}
      />
    );
  }

  // Default: organizations
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
      tabs={tabsWithNavigation}
      verboseName={translate('Organizations')}
      showPageSizeSelector={true}
      tableActions={<OfferingCustomersListFilter uniqueFormId={uniqueFormId} />}
      hasQuery={false}
    />
  );
};
