import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import {
  Proposal,
  ProposalResource,
  ProposalReview,
} from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
  } = useQuery({
    queryKey: ['publicCall', proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({ path: { uuid: proposal.call_uuid } }).then(
        (r) => r.data,
      ),

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

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
    <div id={props.id}>
      <Table<ProposalResource>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.requested_offering.offering_name}</>,
            filter: 'offering',
            inlineFilter: (row) => ({
              offering_name: row.requested_offering.offering_name,
              offering_uuid: row.requested_offering.offering_uuid,
            }),
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
        verboseName={translate('Resources')}
        emptyMessage={translate(
          'No resources available in the current project. Start by adding or managing resources to get started.',
        )}
        minHeight="auto"
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
              onClick={() =>
                onAddCommentClick({
                  commentField: 'comment_resource_requests',
                  label: props.title,
                })
              }
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
        footer={
          <FieldReviewComments
            reviews={reviews}
            fieldName="comment_resource_requests"
            space={0}
            className="mt-5"
          />
        }
      />
    </div>
  );
};
