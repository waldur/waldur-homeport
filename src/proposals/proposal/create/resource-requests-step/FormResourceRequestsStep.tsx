import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import {
  proposalProposalsResourcesList,
  proposalPublicCallsRetrieve,
  RequestedResource,
} from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
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
import { ResourceRequestTemplates } from './ResourceRequestTemplates';

// Simplified filter state - remove Redux Form dependency

export const FormResourceRequestsStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;

  // Check if proposal has compliance - collapse panels only if compliance exists
  const hasCompliance = !!proposal?.compliance_status;
  const change = props.params?.change;
  const reviews: ProposalReview[] = props.params?.reviews;
  const onAddCommentClick = props.params?.onAddCommentClick;
  const readOnlyMode = props.params.readOnly;

  const [resourceRequests, setResourceRequests] = useState<RequestedResource[]>(
    [],
  );

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

  const filter = useMemo(() => ({}), []); // Stable filter object to prevent re-render loops

  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher(proposalProposalsResourcesList, {
      path: { uuid: proposal.uuid },
    }),
    filter,
    onFetch(rows) {
      if (change) {
        setResourceRequests([...rows]);
        change('resources', rows);
        change('resources_init', [...rows]);
      }
    },
  });

  // If the call has resource templates, change 'resources' field so that the values correspond to the templates.
  useEffect(() => {
    if (call?.resource_templates?.length && resourceRequests.length) {
      const selectedTemplates = resourceRequests.map((req) =>
        call.resource_templates.find(
          (template) => template.url === req.call_resource_template,
        ),
      );
      change('resources', [...selectedTemplates]);
    }
  }, [resourceRequests, call]);

  return (
    <AccordionCard
      id={props.id}
      title={translate('Resource requests')}
      subtitle={translate('Resources requested for your project.')}
      defaultOpen={!hasCompliance}
    >
      {call?.resource_templates?.length && !readOnlyMode ? (
        <ResourceRequestTemplates
          call={call}
          proposal={proposal}
          title={props.title}
        />
      ) : (
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
          emptyMessage={
            readOnlyMode
              ? translate('No resources available in the current project.')
              : translate(
                  'No resources available in the current project. Start by adding or managing resources to get started.',
                )
          }
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
      )}
    </AccordionCard>
  );
};
