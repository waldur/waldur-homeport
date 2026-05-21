import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useMemo, FC } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  proposalProposalsResourcesList,
  proposalPublicCallsRetrieve,
  RequestedResource,
} from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Proposal, ProposalResource, ProposalReview } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { VStepperFormStepProps } from '@/wizard';

import { AddCommentButton } from '../../create-review/AddCommentButton';
import { FieldReviewComments } from '../../create-review/FieldReviewComments';
import { StepHeaderContent } from '../StepHeaderContent';

import { AddResourceButton } from './AddResourceButton';
import { ProposalResourcesFilter, FORM_ID } from './ProposalResourcesFilter';
import { ResourceRequestExpandableRow } from './ResourceRequestExpandableRow';
import { ResourceRequestItemActions } from './ResourceRequestItemActions';
import { ResourceRequestTemplates } from './ResourceRequestTemplates';

const ProposalResourcesTableComponent: FC<any> = ({
  proposal,
  call,
  stepProps,
  handleFetch,
  isLoading,
  error,
  refetchCall,
  readOnlyMode,
  reviews,
  onAddCommentClick,
}) => {
  const { values } = useFormState();
  const filter = useMemo(() => {
    const res: any = {};
    if (values?.offering) {
      res.offering_uuid = values.offering.offering_uuid;
    }
    return res;
  }, [values]);

  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher(proposalProposalsResourcesList, {
      path: { uuid: proposal.uuid },
    }),
    filter,
    onFetch: handleFetch,
  });

  return (
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
      title={stepProps.title}
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
          <AddResourceButton proposal={proposal} refetch={tableProps.fetch} />
        ) : onAddCommentClick ? (
          <AddCommentButton
            review={reviews?.[0]}
            onClick={() =>
              onAddCommentClick({
                commentField: 'comment_resource_requests',
                label: stepProps.title,
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
      formId={FORM_ID}
    />
  );
};

const ProposalResourcesTable: FC<any> = (props) => (
  <Form id={FORM_ID} onSubmit={() => {}} subscription={{ values: true }}>
    {() => <ProposalResourcesTableComponent {...props} />}
  </Form>
);

export const FormResourceRequestsStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const change = props.params?.change;
  const reviews: ProposalReview[] = props.params?.reviews;
  const onAddCommentClick = props.params?.onAddCommentClick;
  const readOnlyMode = props.params.readOnly;
  const values = props.params?.values;
  const isCompleted = props.params?.isCompleted;
  const isRequired = props.params?.isRequired;
  const isOpen = props.params?.isOpen;
  const onToggle = props.params?.onToggle;

  // Get resource count from form values
  const resourceCount = values?.resources_init?.length || 0;

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
    staleTime: SHORT_STALE_TIME,
  });

  // Memoize onFetch to prevent infinite re-render loops
  // (onFetch is in useTableQuery's useEffect dependency array)
  const handleFetch = useCallback(
    (rows: RequestedResource[]) => {
      if (change) {
        setResourceRequests([...rows]);
        change('resources', rows);
        change('resources_init', [...rows]);
      }
    },
    [change],
  );

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
      isOpen={isOpen}
      onToggle={onToggle}
      actions={
        <StepHeaderContent
          isCompleted={isCompleted}
          isRequired={isRequired}
          metadata={
            resourceCount > 0
              ? translate('{count} resources', { count: resourceCount })
              : undefined
          }
        />
      }
    >
      {call?.resource_templates?.length && !readOnlyMode ? (
        <ResourceRequestTemplates
          call={call}
          proposal={proposal}
          title={props.title}
        />
      ) : (
        <ProposalResourcesTable
          proposal={proposal}
          call={call}
          stepProps={props}
          handleFetch={handleFetch}
          isLoading={isLoading}
          error={error}
          refetchCall={refetchCall}
          readOnlyMode={readOnlyMode}
          reviews={reviews}
          onAddCommentClick={onAddCommentClick}
        />
      )}
    </AccordionCard>
  );
};
