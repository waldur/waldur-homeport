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
import {
  CallNameLink,
  CurrentRoundCell,
  CutoffCell,
} from '../provider-calls/ProviderCallsTable';

import { getRequestPlanName } from './OfferingRequestCommitments';
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
          render: CallNameLink,
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
            <span className={row.plan ? undefined : 'text-quaternary'}>
              {getRequestPlanName(row)}
            </span>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
              <CallOfferingStateField row={row} />
              {row.state === 'canceled' && row.rejection_reason ? (
                <span
                  className="text-quaternary whitespace-normal"
                  title={row.rejection_reason}
                >
                  {row.rejection_reason}
                </span>
              ) : null}
            </div>
          ),
          filter: 'state',
          inlineFilter: (row) =>
            RequestedOfferingStatesOptions.filter((s) => s.value === row.state),
        },
        {
          title: translate('Current round'),
          render: CurrentRoundCell,
        },
        {
          title: translate('Cut-off'),
          render: CutoffCell,
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
