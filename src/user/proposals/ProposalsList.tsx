import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalCallRound } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

import { ProposalsListExpandableRow } from './ProposalsListExpandableRow';
import { ProposalsListPlaceholder } from './ProposalsListPlaceholder';
import { ProposalsTableFilter } from './ProposalsTableFilter';

interface ProposalsListProps {
  round: ProposalCallRound;
}

const ProposalEndingField = ({ row }) => {
  const data = useMemo(() => {
    if (!row.round.cutoff_time) return {};
    const endDate = parseDate(row.round.cutoff_time);
    const diffNowDays = endDate.diffNow().as('days');
    const textClass = diffNowDays <= 4 ? 'text-danger' : '';
    return {
      text: diffNowDays > 0 ? endDate.toRelative() : translate('Has ended'),
      date: endDate.toISODate(),
      textClass,
    };
  }, [row]);

  if (!row.round.cutoff_time) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <div className={data.textClass}>
      {data.text} ({data.date})
    </div>
  );
};

const filtersSelctor = createSelector(
  getFormValues(USER_PROPOSALS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
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
          render: ({ row }) => <>{renderFieldOrDash(row.call)}</>,
        },
        {
          title: translate('Ending'),
          render: ProposalEndingField,
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
