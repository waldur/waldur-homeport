import { CheckCircleIcon, CubeIcon, QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { startCase } from 'lodash-es';
import { FC, useEffect, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
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
import { ProposalCostTotal } from '@/proposals/ProposalCostTotal';
import { PurchaseOrderCell } from '@/proposals/PurchaseOrderCell';
import { getRequestedResourceCost } from '@/proposals/requestedResourceCost';
import { RequestedResourceCostLabel } from '@/proposals/RequestedResourceCostLabel';
import { ProposalReview } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { ActionButton } from '@/table/ActionButton';
import { selectAllRows } from '@/table/actions';
import { createClientPaginatedFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { getTableState } from '@/table/selectors';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { useSubmitProposalResourcesFromTemplates } from '../utils';

interface ResourceRequestTemplatesProps {
  call: PublicCall;
  proposal: Proposal;
  reviews?: ProposalReview[];
  // Parent form's `form.change`, used to keep `resources_init` (the step's
  // completion gate) in sync with the saved resource requests.
  change?: (field: string, value: any) => void;
}

const ExpandableRow = ({ row }: { row: CallResourceTemplate }) => {
  const keyValues = Object.entries(row.limits || {});
  return (
    <ExpandableContainer hasMultiSelect className="fluid">
      {/* Off the table: the plan is a property of the template rather than
          something to compare rows by, and the column it held was pushing the
          cost and the purchase order behind a sideways scroll. */}
      <Row className="fs-6 mb-4">
        <Col sm={6}>
          <Field
            label={translate('Plan')}
            value={renderFieldOrDash(row.requested_offering_plan?.name)}
            labelCol={5}
            valueCol={7}
          />
        </Col>
      </Row>
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

/**
 * What this table is, given the step card above already names it.
 *
 * Repeating "Resource requests" here put the same heading on screen twice; the
 * badge is the part that says something the card header does not.
 */
const TableTitle = () => (
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
  >
    {translate('Template based')}
  </Badge>
);

/**
 * A template read as the request it would become.
 *
 * Lets the estimate reuse the same pricing the saved requests are shown with,
 * so a template and the request made from it cannot quote different figures.
 */
const templateAsRequest = (template: CallResourceTemplate) => ({
  requested_offering: {
    offering_type: template.requested_offering_type,
    components: template.requested_offering_components,
    plan_details: template.requested_offering_plan,
  },
  limits: template.limits,
});

const TABLE_ID = 'ProposalResourceTemplatesList';

export const ResourceRequestTemplates: FC<ResourceRequestTemplatesProps> = ({
  call,
  proposal,
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

  // The purchase order lives on the saved request, not on the template it was
  // made from, so each row reads it through the request it produced.
  //
  // Not every request in a template-based call was made from a template — one
  // attached straight from the offering page carries no template link — so a
  // request that names no template is matched on the call entry it was made
  // against instead, and only where that entry has a single template to be
  // confused with.
  const requestByTemplate = useMemo(() => {
    const templates = call.resource_templates || [];
    const templatesPerOffering = new Map<string, number>();
    for (const template of templates) {
      const key = template.requested_offering_uuid;
      templatesPerOffering.set(key, (templatesPerOffering.get(key) || 0) + 1);
    }
    const map = new Map<string, RequestedResource>();
    for (const resource of initialResources as RequestedResource[]) {
      if (resource.call_resource_template) {
        map.set(resource.call_resource_template, resource);
        continue;
      }
      const offeringUuid = (resource.requested_offering as any)?.uuid;
      if (templatesPerOffering.get(offeringUuid) !== 1) {
        continue;
      }
      const template = templates.find(
        (item) => item.requested_offering_uuid === offeringUuid,
      );
      if (template && !map.has(template.url)) {
        map.set(template.url, resource);
      }
    }
    return map;
  }, [initialResources, call.resource_templates]);

  // Only worth a column where a purchase order is part of the deal: elsewhere
  // it would be a column of dashes.
  const showPurchaseOrder = useMemo(
    () =>
      [...requestByTemplate.values()].some(
        (resource: any) =>
          resource.purchase_order_required || resource.has_purchase_order,
      ),
    [requestByTemplate],
  );

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
        // No count of preconfigured attributes: the expanded row lists the
        // attributes themselves, and the column it cost was pushing the cost
        // and the purchase order off the right edge of the table.
        {
          // Estimated, not billed: priced here from the template's own amounts
          // and the plan's price list, the same way a saved request is.
          title: translate('Estimated cost'),
          render: ({ row }) => (
            <RequestedResourceCostLabel
              cost={getRequestedResourceCost(templateAsRequest(row))}
              stacked
            />
          ),
        },
        ...(showPurchaseOrder
          ? [
              {
                title: translate('Purchase order'),
                render: ({ row }) => {
                  const request = requestByTemplate.get(row.url);
                  return request ? (
                    <PurchaseOrderCell row={request as any} />
                  ) : (
                    <>{DASH_ESCAPE_CODE}</>
                  );
                },
              },
            ]
          : []),
      ]}
      title={<TableTitle />}
      cardBordered={false}
      bodyClassName="px-0"
      headerClassName="mx-0"
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
        <>
          {/* What the proposal would cost is what is selected, not what the
              call offers — an unselected template is not being asked for. */}
          <ProposalCostTotal rows={selectedRows.map(templateAsRequest)} />
          <FieldReviewComments
            reviews={reviews}
            fieldName="comment_resource_requests"
            space={0}
            className="mt-5"
          />
        </>
      }
    />
  );
};
