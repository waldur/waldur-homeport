import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState, FC } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  proposalProposalsResourcesList,
  proposalPublicCallsRetrieve,
  RequestedResource,
} from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { Proposal, ProposalResource, ProposalReview } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { VStepperFormStepProps } from '@/wizard';

import { AddCommentButton } from '../../create-review/AddCommentButton';
import { FieldReviewComments } from '../../create-review/FieldReviewComments';
import { StepHeaderContent } from '../StepHeaderContent';

import { AddResourceButton } from './AddResourceButton';
import { FORM_ID, ProposalResourcesFilter } from './ProposalResourcesFilter';
import { resourceRequestColumns } from './resourceRequestColumns';
import { ResourceRequestExpandableRow } from './ResourceRequestExpandableRow';
import { ResourceRequestItemActions } from './ResourceRequestItemActions';
import { ResourceRequestTemplates } from './ResourceRequestTemplates';

// Stable identity so the inert filter form does not reinitialise on every render.
const NOOP_SUBMIT = () => undefined;
const columns = resourceRequestColumns({ offeringFilter: true });

interface ProposalResourcesTableProps {
  proposal: Proposal;
  /** Supplies the offerings the filter can choose between. */
  call?: { offerings?: any[] };
  handleFetch(rows: RequestedResource[]): void;
  readOnlyMode?: boolean;
  reviews?: ProposalReview[];
  onTableReady(fetch: () => void): void;
  /** Reloads the table and the summary the sidebar totals from. */
  refetchTable(): void;
}

const ProposalResourcesTableComponent: FC<ProposalResourcesTableProps> = ({
  proposal,
  call,
  handleFetch,
  readOnlyMode,
  reviews,
  onTableReady,
  refetchTable,
}) => {
  // The filter form lives in the surrounding <Form id={FORM_ID}>; its selected
  // offering narrows the query the table runs.
  const { values } = useFormState();
  const filter = useMemo(
    () =>
      values?.offering
        ? { offering_uuid: values.offering.offering_uuid }
        : undefined,
    [values],
  );

  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher(proposalProposalsResourcesList, {
      path: { uuid: proposal.uuid },
    }),
    filter,
    onFetch: handleFetch,
  });

  // The Add button sits on the card's title row, outside this component, so it
  // is handed the reload the table would otherwise keep to itself.
  useEffect(() => {
    onTableReady?.(tableProps.fetch);
  }, [onTableReady, tableProps.fetch]);

  return (
    <Table<ProposalResource>
      {...tableProps}
      // Provider and category live in the expanded row instead: the progress
      // rail narrows this panel, and six columns pushed estimated cost and
      // purchase order — what a reviewer is here for — behind a sideways
      // scroll.
      columns={columns}
      // The step card above already carries this heading and its own border;
      // repeating both gave the panel a second "Resource requests" title inside
      // a nested box. Same treatment the project team step gives its table.
      hideTitle
      cardBordered={false}
      // The step is already a card: this table adds no card and no insets of
      // its own, so it sits flush inside the step rather than reading as a
      // second panel nested in the first.
      className="border-0 shadow-none"
      bodyClassName="p-0"
      headerClassName="mx-0"
      fullWidth
      filters={
        readOnlyMode ? null : (
          <ProposalResourcesFilter offerings={call?.offerings} />
        )
      }
      formId={FORM_ID}
      verboseName={translate('Resources')}
      emptyMessage={
        readOnlyMode
          ? translate('No resources available in the current project.')
          : translate(
              'No resources available in the current project. Start by adding or managing resources to get started.',
            )
      }
      minHeight="auto"
      expandableRow={ResourceRequestExpandableRow}
      // The step's own reload, not the table's: an edit or a delete changes
      // what the summary totals just as much as an add does, and only the
      // former reloads both.
      rowActions={({ row }) =>
        !readOnlyMode ? (
          <ResourceRequestItemActions
            row={row}
            proposal={proposal}
            refetch={refetchTable}
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
  );
};

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
  // A ref, not state: passing the table's own fetch through setState would run
  // it as an updater, and the button needs a handle that never goes stale.
  const reloadTableRef = useRef<() => void>(undefined);
  const handleTableReady = useCallback((fetch: () => void) => {
    reloadTableRef.current = fetch;
  }, []);
  const queryClient = useQueryClient();
  // Every add, edit and delete comes through here — the one place that knows
  // the summary's list has moved on. Invalidating from the table's onFetch
  // instead fired on the first load and on every page change, so each visit
  // paged through the whole list twice before showing a total.
  const refetchTable = useCallback(() => {
    reloadTableRef.current?.();
    queryClient.invalidateQueries({
      queryKey: ['ProposalResourcesSummary', proposal.uuid],
    });
  }, [queryClient, proposal.uuid]);

  // Only the templates branch and the Add button read this; the table below
  // renders from the proposal's own resources.
  const { data: call } = useQuery({
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
        // On the title row rather than in a toolbar of its own: the step is one
        // card, and a second bar under the divider only pushed the table down.
        <div className="d-flex align-items-center gap-4">
          {readOnlyMode ? (
            onAddCommentClick ? (
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
          ) : call?.resource_templates?.length ? null : (
            <AddResourceButton proposal={proposal} refetch={refetchTable} />
          )}
          <StepHeaderContent
            isCompleted={isCompleted}
            isRequired={isRequired}
            metadata={
              resourceCount > 0
                ? // Whole strings per form rather than a noun after a number:
                  // inflected languages do not take "{count} resource(s)".
                  resourceCount === 1
                  ? translate('{count} resource', { count: resourceCount })
                  : translate('{count} resources', { count: resourceCount })
                : undefined
            }
          />
        </div>
      }
    >
      {call?.resource_templates?.length && !readOnlyMode ? (
        <ResourceRequestTemplates
          call={call}
          proposal={proposal}
          change={change}
          reviews={reviews}
        />
      ) : (
        <Form
          id={FORM_ID}
          onSubmit={NOOP_SUBMIT}
          subscription={{ values: true }}
        >
          {() => (
            <ProposalResourcesTableComponent
              proposal={proposal}
              call={call}
              handleFetch={handleFetch}
              readOnlyMode={readOnlyMode}
              reviews={reviews}
              onTableReady={handleTableReady}
              refetchTable={refetchTable}
            />
          )}
        </Form>
      )}
    </AccordionCard>
  );
};
