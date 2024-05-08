import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PROPOSALS_FILTER_FORM_ID } from '@waldur/proposals/constants';
import {
  formatProposalState,
  getProposalStateOptions,
} from '@waldur/proposals/utils';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { EndingField } from '../EndingField';

import { ProposalsListExpandableRow } from './ProposalsListExpandableRow';
import { ProposalsListPlaceholder } from './ProposalsListPlaceholder';
import { ProposalsTableFilter } from './ProposalsTableFilter';

const filtersSelector = createSelector(
  getFormValues(PROPOSALS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call_uuid = filters.call.uuid;
    }
    result.o = '-round__cutoff_time';
    return result;
  },
);

export const UserProposalsList: FC = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'MyProposalsList',
    fetchData: createFetcher('proposal-proposals'),
    queryField: 'name',
    filter,
  });

  const initialValues = useMemo(
    () => ({
      state: getProposalStateOptions().filter(
        (option) => option.value !== 'canceled' && option.value !== 'rejected',
      ),
    }),
    [],
  );

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
      ]}
      title={translate('My proposals')}
      verboseName={translate('My proposals')}
      hasQuery={true}
      expandableRow={ProposalsListExpandableRow}
      hoverableRow={({ row }) => (
        <Link
          state="public-calls.manage-proposal"
          params={{
            proposal_uuid: row.uuid,
          }}
          className="btn btn-primary"
        >
          {translate('View')}
        </Link>
      )}
      filters={<ProposalsTableFilter initialValues={initialValues} />}
    />
  );
};
