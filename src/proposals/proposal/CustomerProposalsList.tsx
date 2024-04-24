import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { formatProposalState } from '@waldur/proposals/utils';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { PROPOSALS_FILTER_FORM_ID } from '../constants';
import { EndingField } from '../EndingField';

import { ProposalRowActions } from './ProposalRowActions';
import { ProposalsTableFilter } from './ProposalsTableFilter';
import { ProposalStatus } from './ProposalStatus';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(PROPOSALS_FILTER_FORM_ID),
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
          render: ProposalStatus,
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      filters={<ProposalsTableFilter form={PROPOSALS_FILTER_FORM_ID} />}
      hoverableRow={ProposalRowActions}
    />
  );
};
