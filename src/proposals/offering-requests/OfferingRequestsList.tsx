import { FC, useMemo } from 'react';
import {
  proposalRequestedOfferingsList,
  ProtectedRound,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  ProposalRequestedOfferingsFilter,
  selectProposalRequestedOfferingsFilter,
  RequestedOfferingStatesOptions,
  ProposalRequestedOfferingsFilterFormId,
} from '@/table/generated/ProposalRequestedOfferingsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { CallOfferingStateField } from '../details/CallOfferingStateField';

import { OfferingRequestItemActions } from './OfferingRequestItemActions';
import { OfferingRequestsListExpandableRow } from './OfferingRequestsListExpandableRow';

interface OfferingRequestsListProps {
  round: ProtectedRound;
}

export const OfferingRequestsList: FC<OfferingRequestsListProps> = () => {
  const customer = useCustomer();
  const values = useFilterValues('ProposalRequestedOfferingsList');

  const formFilters = useMemo(
    () => selectProposalRequestedOfferingsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({ provider_uuid: customer?.uuid, o: ['-created'], ...formFilters }),
    [customer?.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'ProposalRequestedOfferingsList',
    syncFiltersToURL: true,
    fetchData: createFetcher(proposalRequestedOfferingsList),
    queryField: 'call_name',
    filter,
  });

  return (
    <Table<ProviderRequestedOffering>
      {...tableProps}
      columns={[
        {
          title: translate('Call'),
          render: ({ row }) => <>{row.call_name}</>,
          filter: 'call',
          inlineFilter: (row) => ({ name: row.call_name, url: row.call }),
        },
        {
          title: translate('Call manager'),
          render: ({ row }) => <>{row.call_managing_organisation}</>,
          filter: 'organization_uuid',
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
          filter: 'offering',
          inlineFilter: (row) => ({
            name: row.offering_name,
            url: row.offering,
          }),
        },
        {
          title: translate('Plan'),
          render: ({ row }) => (
            <>{row.plan ? row.plan_details.name : translate('Ordinary plan')}</>
          ),
        },
        {
          title: translate('State'),
          render: CallOfferingStateField,
          filter: 'state',
          inlineFilter: (row) =>
            RequestedOfferingStatesOptions.filter((s) => s.value === row.state),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
      ]}
      title={translate('Requests for offerings')}
      verboseName={translate('Requests for offerings')}
      hasQuery={true}
      expandableRow={OfferingRequestsListExpandableRow}
      rowActions={OfferingRequestItemActions}
      filters={<ProposalRequestedOfferingsFilter />}
      formId={ProposalRequestedOfferingsFilterFormId}
    />
  );
};
