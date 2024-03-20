import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { Round } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OFFERING_REQUESTS_FILTER_FORM_ID } from '../constants';
import { formatCallOfferingState } from '../utils';

import { OfferingRequestItemActions } from './OfferingRequestItemActions';
import { OfferingRequestsListExpandableRow } from './OfferingRequestsListExpandableRow';
import { OfferingRequestsListPlaceholder } from './OfferingRequestsListPlaceholder';
import { OfferingRequestsTableFilter } from './OfferingRequestsTableFilter';

interface OfferingRequestsListProps {
  round: Round;
}

const filtersSelctor = createSelector(
  getFormValues(OFFERING_REQUESTS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.organization) {
      result.organization_uuid = filters.organization.uuid;
    }
    if (filters?.call) {
      result.call = filters.call.url;
    }
    if (filters?.offering) {
      result.offering = filters.offering.url;
    }
    return result;
  },
);

export const OfferingRequestsList: FC<OfferingRequestsListProps> = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'ProposalRequestedOfferingsList',
    fetchData: createFetcher('proposal-requested-offerings'),
    queryField: 'call_name',
    filter,
  });

  return (
    <Table
      {...tableProps}
      placeholderComponent={<OfferingRequestsListPlaceholder />}
      columns={[
        {
          title: translate('Call'),
          render: ({ row }) => <b>{row.call_name}</b>,
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <>{row.call_managing_organisation}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
        },
        {
          title: translate('Period'),
          render: ({ row }) => (
            <>{row.plan_name ? row.plan_name : translate('Ordinary plan')}</>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{formatCallOfferingState(row.state)}</>,
        },
      ]}
      title={translate('Offering requests')}
      verboseName={translate('Offering requests')}
      hasQuery={true}
      actions={<Button variant="success">{translate('Accept request')}</Button>}
      expandableRow={OfferingRequestsListExpandableRow}
      hoverableRow={OfferingRequestItemActions}
      filters={<OfferingRequestsTableFilter />}
    />
  );
};
