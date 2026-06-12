import { CheckCircleIcon, CubeIcon, QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { startCase } from 'lodash-es';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CallResourceTemplate,
  Proposal,
  proposalProposalsResourcesList,
  PublicCall,
  RequestedResource,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { SHORT_STALE_TIME } from '@/core/constants';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { FieldReviewComments } from '@/proposals/proposal/create-review/FieldReviewComments';
import { ProposalReview } from '@/proposals/types';
import { ActionButton } from '@/table/ActionButton';
import { selectAllRows } from '@/table/actions';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { getTableState } from '@/table/selectors';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { useSubmitProposalResourcesFromTemplates } from '../utils';

interface ResourceRequestTemplatesProps {
  call: PublicCall;
  proposal: Proposal;
  title: string;
  reviews?: ProposalReview[];
  // Parent form's `form.change`, used to keep `resources_init` (the step's
  // completion gate) in sync with the saved resource requests.
  change?: (field: string, value: any) => void;
}

const ExpandableRow = ({ row }: { row: CallResourceTemplate }) => {
  const keyValues = Object.entries(row.limits || {});
  return (
    <ExpandableContainer hasMultiSelect>
      {!keyValues.length ? (
        <span>{translate('This resource request has no attributes.')}</span>
      ) : (
        <div className="card card-table card-bordered">
          <div className="card-body">
            <table className="table align-middle">
              <thead>
                <tr className="align-middle">
                  <th style={{ width: '50%' }}>
                    {translate('Attribute name')}
                  </th>
                  <th style={{ width: '50%' }}>{translate('Value')}</th>
                </tr>
              </thead>
              <tbody>
                {keyValues.map(([key, value], index) => (
                  <tr key={index}>
                    <td>{startCase(key)}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ExpandableContainer>
  );
};

const TableTitle = ({ title }) => (
  <>
    {title}
    <Badge
      variant="info"
      size="lg"
      leftIcon={<CubeIcon weight="bold" />}
      rightIcon={
        <Tip
          label={translate(
            'This call uses predefined resource templates. You can only select from the available templates below. Custom resource configurations are not allowed.',
          )}
          id="tip-resource-templates"
          autoWidth
          className="w-100"
          tipClassName="mw-350px"
        >
          <QuestionIcon weight="bold" size={16} />
        </Tip>
      }
      pill
      outline
      className="ms-3"
    >
      {translate('Template based')}
    </Badge>
  </>
);

const TABLE_ID = 'ProposalResourceTemplatesList';

export const ResourceRequestTemplates: FC<ResourceRequestTemplatesProps> = ({
  call,
  proposal,
  title,
  reviews,
  change,
}) => {
  const dispatch = useDispatch();

  // Fetch existing resources for this proposal
  const { data } = useQuery({
    queryKey: ['proposalResources', proposal.uuid],
    queryFn: () =>
      proposalProposalsResourcesList({ path: { uuid: proposal.uuid } }).then(
        (r) => r.data,
      ),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });
  const initialResources = data ?? [];

  // Keep the parent form's `resources_init` — which gates this step's completion
  // — aligned with the saved resource requests. Templates mode never wrote this
  // field, so the step relied on a transient mount of the table component and
  // went stale after saving (the checkbox only ticked after a full page reload).
  // Syncing here updates it as soon as the query resolves or refetches, e.g.
  // after Save invalidates ['proposalResources', proposal.uuid].
  useEffect(() => {
    if (change && data) {
      change('resources_init', data);
    }
  }, [data, change]);

  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createClientPaginatedFetcher(call.resource_templates),
  });

  // Get selected rows from table state
  const tableState = useSelector(getTableState(TABLE_ID));
  const selectedRows: CallResourceTemplate[] = tableState?.selectedRows || [];

  // Initialize selection with existing resources when data loads
  useEffect(() => {
    if (
      initialResources.length > 0 &&
      call.resource_templates?.length > 0 &&
      tableState?.selectedRows?.length === 0
    ) {
      // Find templates that match existing resources
      const initialSelection = call.resource_templates.filter((template) =>
        initialResources.some(
          (resource: RequestedResource) =>
            resource.call_resource_template === template.url,
        ),
      );
      if (initialSelection.length > 0) {
        dispatch(selectAllRows(TABLE_ID, initialSelection));
      }
    }
  }, [initialResources, call.resource_templates, dispatch]);

  const {
    save: saveSelections,
    newCount,
    removedCount,
    isPending,
  } = useSubmitProposalResourcesFromTemplates(
    proposal,
    selectedRows,
    initialResources as RequestedResource[],
  );

  return (
    <Table<CallResourceTemplate>
      {...tableProps}
      // Render all templates: the header select-all checkbox replaces the
      // selection with the visible rows, so paginating would silently drop
      // pre-selected templates on other pages and delete their resource
      // requests on save.
      rows={call.resource_templates || []}
      hasPagination={false}
      enableMultiSelect
      columns={[
        {
          title: translate('Template name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.requested_offering_name}</>,
        },
        {
          title: translate('Plan'),
          render: ({ row }) =>
            renderFieldOrDash(row.requested_offering_plan?.name),
        },
        {
          title: translate('Preconfigured attributes'),
          render: ({ row }) => <>{Object.keys(row.limits || {}).length}</>,
        },
      ]}
      title={<TableTitle title={title} />}
      verboseName={translate('Resources')}
      emptyMessage={translate(
        'No resource templates available in the current call.',
      )}
      minHeight="auto"
      hideRefresh
      tableActions={
        <ActionButton
          action={saveSelections as any}
          title={translate('Save')}
          iconNode={<CheckCircleIcon weight="bold" />}
          disabled={!newCount && !removedCount}
          disabledReason={translate('No changes to save')}
          pending={isPending}
          className="min-w-125px"
        />
      }
      expandableRow={ExpandableRow}
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
