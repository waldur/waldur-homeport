import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { Round } from '@waldur/proposals/types';
import { formatProposalState } from '@waldur/proposals/utils';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { USER_PROPOSALS_FILTER_FORM_ID } from '@waldur/user/constants';
import { EndingField } from '@waldur/user/proposals/EndingField';
import { ProposalsTableFilter } from '@waldur/user/proposals/ProposalsTableFilter';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProposalRowActions } from '../round/proposals/ProposalRowActions';

interface ProposalsListProps {
  round: Round;
}

const mapPropsToFilter = createSelector(
  getCustomer,
  getFormValues(USER_PROPOSALS_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: Record<string, any> = {};
    if (customer) {
      result.organization_uuid = customer.uuid;
    }

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

export const ProposalsList: FC<ProposalsListProps> = () => {
  const filter = useSelector(mapPropsToFilter);
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
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Call'),
          render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{renderFieldOrDash(row.round.name)}</>,
        },
        {
          title: translate('Ending'),
          render: ({ row }) => <EndingField endDate={row.round?.cutoff_time} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{formatProposalState(row.state)}</>,
        },
        {
          title: translate('Status'),
          render: () => (
            <>
              {[true, null, null, null, null].map((state, i) => {
                const bg =
                  state === true
                    ? 'bg-success'
                    : state === false
                    ? 'bg-danger'
                    : 'bg-secondary';
                return (
                  <span
                    key={i}
                    className={
                      'w-15px h-15px d-inline-block rounded-circle me-4 ' + bg
                    }
                  ></span>
                );
              })}
            </>
          ),
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      filters={<ProposalsTableFilter />}
      hoverableRow={ProposalRowActions}
    />
  );
};
