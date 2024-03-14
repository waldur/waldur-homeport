import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { ProposalCallRound } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

import { EndingField } from './EndingField';
import { ProposalsListExpandableRow } from './ProposalsListExpandableRow';
import { ProposalsListPlaceholder } from './ProposalsListPlaceholder';
import { ProposalsTableFilter } from './ProposalsTableFilter';

interface ProposalsListProps {
  round: ProposalCallRound;
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
    return result;
  },
);

export const ProposalsList: FC<ProposalsListProps> = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'MyProposalsList',
    fetchData: createFetcher('proposal-proposals', {
      params: { o: '-round__cutoff_time' },
    }),
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
          render: ({ row }) => <>{row.state}</>,
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
      hoverableRow={() => <Button>{translate('View')}</Button>}
      filters={<ProposalsTableFilter />}
    />
  );
};