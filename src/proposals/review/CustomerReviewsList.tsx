import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { proposalReviewsList, ProposalReviewsListData } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { EndingField } from '@/proposals/EndingField';
import { ProposalReview } from '@/proposals/types';
import { getReviewStateOptions } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import {
  ProposalReviewsFilter,
  ProposalReviewsFilterFormId,
  selectProposalReviewsFilter,
} from '@/table/generated/ProposalReviewsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewStateRenderer } from './ReviewStateRenderer';

const CustomerReviewsListTable: FC<{}> = () => {
  const customer = useCustomer();
  const { values } = useFormState();
  const filterValues = useMemo(
    () => selectProposalReviewsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: ProposalReviewsListData['query'] = { ...filterValues };
    if (customer) {
      result.organization_uuid = customer.uuid;
    }
    return result;
  }, [customer, filterValues]);

  const tableProps = useTable({
    table: 'ReviewsList',
    fetchData: createFetcher(proposalReviewsList),
    queryField: 'proposal_name',
    filter,
  });

  return (
    <Table<ProposalReview>
      {...tableProps}
      formId={ProposalReviewsFilterFormId}
      columns={[
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          keys: ['uuid'],
          id: 'uuid',
          optional: true,
        },
        {
          title: translate('Proposal'),
          render: ({ row }) => <>{row.proposal_name}</>,
          keys: ['proposal_name'],
          id: 'proposal',
        },
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.reviewer_full_name}</>,
          keys: ['reviewer_full_name'],
          id: 'reviewer',
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
          keys: ['call_name'],
          id: 'call',
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{row.round_name}</>,
          keys: ['round_name'],
          id: 'round',
          optional: true,
        },
        {
          title: translate('Review due'),
          render: ({ row }) => <EndingField endDate={row.review_end_date} />,
          keys: ['review_end_date'],
          id: 'review_due',
        },
        {
          title: translate('State'),
          render: ReviewStateRenderer,

          filter: 'state',
          inlineFilter: (row) =>
            getReviewStateOptions().filter((s) => s.value === row.state),
          keys: ['state'],
          id: 'state',
        },
      ]}
      title={translate('Reviews')}
      verboseName={translate('Reviews')}
      hasQuery={true}
      filters={<ProposalReviewsFilter />}
      rowActions={ReviewsRowActions}
      hasOptionalColumns
    />
  );
};

export const CustomerReviewsList: FC<{}> = () => (
  <Form
    id={ProposalReviewsFilterFormId}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <CustomerReviewsListTable />}
  </Form>
);
