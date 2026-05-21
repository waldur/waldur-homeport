import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { proposalProposalsList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { getNonCanceledProposalStates } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import {
  ProposalsFilter,
  selectProposalsFilter,
  ProposalStatesOptions,
  ProposalsFilterFormId,
} from '@/table/generated/ProposalsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { EndingField } from '../EndingField';
import { ProposalExpandableRow } from '../round/proposals/ProposalExpandableRow';

import { ProposalBadge } from './ProposalBadge';
import { ProposalRowActions } from './ProposalRowActions';

const CustomerProposalsListTable: FC<{}> = () => {
  const customer = useCustomer();
  const { values } = useFormState();
  const formFilters = useMemo(() => selectProposalsFilter(values), [values]);

  const filter = useMemo(
    () => ({
      organization_uuid: customer?.uuid,
      o: ['-round__cutoff_time'],
      state: getNonCanceledProposalStates(),
      ...formFilters,
    }),
    [customer?.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'ProposalsList',
    fetchData: createFetcher(proposalProposalsList),
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
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)} </>,
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
          render: ({ row }) => (
            <EndingField
              endDate={row.round?.cutoff_time}
              hasFixedDuration={Boolean(row.duration_in_days)}
            />
          ),
          className: 'text-nowrap',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ProposalBadge state={row.state} />,
          filter: 'state',
          inlineFilter: (row) =>
            ProposalStatesOptions.filter((s) => s.value === row.state),
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      filters={<ProposalsFilter />}
      rowActions={({ row }) => (
        <ProposalRowActions refetch={tableProps.fetch} row={row} />
      )}
      expandableRow={ProposalExpandableRow}
      formId={ProposalsFilterFormId}
    />
  );
};

export const CustomerProposalsList: FC<any> = (props) => (
  <Form
    id={ProposalsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <CustomerProposalsListTable {...props} />}
  </Form>
);
