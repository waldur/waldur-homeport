import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { ProposalProposalsListData } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  getNonCanceledProposalStates,
  getProposalStateOptions,
} from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { PROPOSALS_FILTER_FORM_ID } from '../constants';
import { EndingField } from '../EndingField';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';

import { ProposalBadge } from './ProposalBadge';
import { ProposalRowActions } from './ProposalRowActions';
import { ProposalsTableFilter } from './ProposalsTableFilter';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(PROPOSALS_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: ProposalProposalsListData['query'] = {};
    if (customer) {
      result.organization_uuid = customer.uuid;
    }
    result.o = ['-round__cutoff_time'];
    result.state = getNonCanceledProposalStates();

    if (filters) {
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
      if (filters.call) {
        result.call_uuid = filters.call.uuid;
      }
    }
    return result;
  },
);

export const CustomerProposalsList: FC<{}> = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: 'ProposalsList',
    fetchData: createFetcher('proposal-proposals'),
    queryField: 'name',
    filter,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Proposal'),
          render: ({ row }) => (
            <Link
              state="call-management.proposal-details"
              params={{ proposal_uuid: row.uuid }}
              label={row.name}
            />
          ),
        },
        {
          title: translate('Applicant'),
          render: ({ row }) => <>{row.created_by_name || '-'} </>,
        },
        {
          title: translate('Call'),
          render: ({ row }) => (
            <Link
              state="protected-call.main"
              params={{ call_uuid: row.call_uuid }}
              label={row.call_name}
            />
          ),

          filter: 'call',
          inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{renderFieldOrDash(row.round.name)}</>,
          orderField: 'round__cutoff_time',
        },
        {
          title: translate('Ending'),
          render: ({ row }) => <EndingField endDate={row.round?.cutoff_time} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
          filter: 'state',
          inlineFilter: (row) =>
            getProposalStateOptions().filter((s) => s.value === row.state),
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      filters={<ProposalsTableFilter form={PROPOSALS_FILTER_FORM_ID} />}
      rowActions={({ row }) => (
        <ProposalRowActions refetch={tableProps.fetch} row={row} />
      )}
      expandableRow={ProposalExpandableRow}
    />
  );
};
