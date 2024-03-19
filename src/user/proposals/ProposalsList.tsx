import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Round } from '@waldur/proposals/types';
import { formatProposalState } from '@waldur/proposals/utils';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

import { EndingField } from './EndingField';
import { ProposalsListExpandableRow } from './ProposalsListExpandableRow';
import { ProposalsListPlaceholder } from './ProposalsListPlaceholder';
import { ProposalsTableFilter } from './ProposalsTableFilter';

interface ProposalsListProps {
  round: Round;
}

const filtersSelctor = createSelector(
  getFormValues(USER_PROPOSALS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call = filters.call.uuid;
    }
    result.o = '-round__cutoff_time';
    return result;
  },
);

export const ProposalsList: FC<ProposalsListProps> = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'MyProposalsList',
    fetchData: createFetcher('proposal-proposals'),
    queryField: 'name',
    filter,
  });

  return (
    <Table
      {...tableProps}
      placeholderComponent={<ProposalsListPlaceholder />}
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
      title={translate('My proposals')}
      verboseName={translate('My proposals')}
      hasQuery={true}
      expandableRow={ProposalsListExpandableRow}
      hoverableRow={({ row }) => (
        <Link
          state="public-calls.manage-proposal"
          params={{
            uuid: row.call_uuid,
            round_uuid: row.round.uuid,
            proposal_uuid: row.uuid,
          }}
          className="btn btn-primary"
        >
          {translate('View')}
        </Link>
      )}
      filters={<ProposalsTableFilter />}
    />
  );
};
