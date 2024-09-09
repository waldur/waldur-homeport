import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
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

  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher(`proposal-proposals/${proposal.uuid}/resources`),
    filter,
    onFetch(rows) {
      if (change) {
        change('resources', rows);
      }
    },
  });

  return (
    <>
      <Table<ProposalResource>
        {...tableProps}
        id={props.id}
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
        title={props.title}
        verboseName={props.title}
        filters={
          readOnlyMode ? null : isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred loadData={refetchCall} />
          ) : (
            <ProposalResourcesFilter offerings={call?.offerings} />
          )
        }
        tableActions={
          !readOnlyMode ? (
            <AddResourceButton
              proposal={props.params.proposal}
              refetch={tableProps.fetch}
            />
          ) : onAddCommentClick ? (
            <AddCommentButton
              review={reviews?.[0]}
              onClick={() => onAddCommentClick('comment_resource_requests')}
            />
          ) : null
        }
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
    </>
  );
};
