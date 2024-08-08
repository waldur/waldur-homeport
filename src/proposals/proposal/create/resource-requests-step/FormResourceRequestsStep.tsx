import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { getPublicCall } from '@waldur/proposals/api';
import {
  Proposal,
  ProposalResource,
  ProposalReview,
} from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { AddCommentButton } from '../../create-review/AddCommentButton';
import { FieldReviewComments } from '../../create-review/FieldReviewComments';

import { AddResourceButton } from './AddResourceButton';
import { ProposalResourcesFilter } from './ProposalResourcesFilter';
import { ResourceRequestExpandableRow } from './ResourceRequestExpandableRow';
import { ResourceRequestItemActions } from './ResourceRequestItemActions';

const mapStateToFilter = createSelector(
  getFormValues('ProposalResourcesFilter'),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.offering) {
      result.offering_uuid = filters.offering.offering_uuid;
    }
    return result;
  },
);
export const FormResourceRequestsStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const change = props.params?.change;
  const reviews: ProposalReview[] = props.params?.reviews;
  const onAddCommentClick = props.params?.onAddCommentClick;
  const readOnlyMode = props.params.readOnly;
  const {
    data: call,
    isLoading,
    error,
    refetch: refetchCall,
  } = useQuery(
    ['publicCall', proposal.call_uuid],
    () => getPublicCall(proposal.call_uuid),
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );

  const filterValues = useSelector(mapStateToFilter);

  const filter = useMemo(
    () => ({
      proposal_uuid: proposal.uuid,
      ...filterValues,
    }),
    [proposal, filterValues],
  );

  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher('proposal-requested-resources'),
    filter,
    onFetch(rows) {
      if (change) {
        change('resources', rows);
      }
    },
  });

  return (
    <VStepperFormStepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
      actions={
        !readOnlyMode ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <AddResourceButton
              proposal={props.params.proposal}
              refetch={tableProps.fetch}
            />
          </div>
        ) : onAddCommentClick ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <AddCommentButton
              onClick={() => onAddCommentClick('comment_resource_requests')}
            />
          </div>
        ) : null
      }
      refetch={tableProps.fetch}
      refetching={tableProps.loading}
    >
      <Table<ProposalResource>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.requested_offering.offering_name}</>,
            filter: 'offering',
          },
          {
            title: translate('Provider'),
            render: ({ row }) => <>{row.requested_offering.provider_name}</>,
          },
          {
            title: translate('Category'),
            render: ({ row }) => (
              <>{renderFieldOrDash(row.requested_offering.category_name)}</>
            ),
          },
        ]}
        title={translate('Requests for offerings')}
        verboseName={translate('Requests for offerings')}
        filters={
          isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred loadData={refetchCall} />
          ) : (
            <ProposalResourcesFilter offerings={call?.offerings} />
          )
        }
        hasActionBar={false}
        expandableRow={ResourceRequestExpandableRow}
        rowActions={({ row, fetch }) =>
          !readOnlyMode ? (
            <ResourceRequestItemActions
              row={row}
              proposal={proposal}
              refetch={fetch}
            />
          ) : null
        }
      />
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_resource_requests"
      />
    </VStepperFormStepCard>
  );
};
