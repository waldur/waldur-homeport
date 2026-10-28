import { CheckCircleIcon, CubeIcon, QuestionIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Form, useField } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  CallResourceTemplate,
  Proposal,
  proposalProposalsResourcesList,
  PublicCall,
  RequestedResource,
} from 'waldur-js-client';

import { AlertItem, Tooltip, BaseButton } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import {
  findQuantityComponent,
  formatComponentQuantity,
  getComponentLabel,
} from '@/marketplace/common/componentQuantity';
import { FieldReviewComments } from '@/proposals/proposal/create-review/FieldReviewComments';
import { ProposalCostTotal } from '@/proposals/ProposalCostTotal';
import { PurchaseOrderCell } from '@/proposals/PurchaseOrderCell';
import { getRequestedResourceCost } from '@/proposals/requestedResourceCost';
import { RequestedResourceCostLabel } from '@/proposals/RequestedResourceCostLabel';
import { ProposalReview } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { selectAllRows } from '@/table/actions';
import { createClientPaginatedFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { getTableState } from '@/table/selectors';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { useSubmitProposalResourcesFromTemplates } from '../utils';

import {
  hasSlurmPlacement,
  SlurmPlacementFields,
} from './SlurmPlacementFields';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 text-sm mb-3">
        <div>
          <Field
            label={translate('Plan')}
            value={renderFieldOrDash(row.requested_offering_plan?.name)}
            labelCol={5}
            valueCol={7}
          />
        </div>
        <SlurmPlacementFields attributes={row.attributes} />
      </div>
      {!keyValues.length ? (
        hasSlurmPlacement(row.attributes) ? null : (
          <span>{translate('This resource request has no attributes.')}</span>
        )
      ) : (
        <div className="card card-table card-bordered">
          <div className="card-body">
            <table className="table align-middle">
              <thead>
                <tr className="align-middle">
                  <th style={{ width: '50%' }}>{translate('Component')}</th>
                  <th style={{ width: '50%' }}>
                    {translate('Requested amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {keyValues.map(([key, value], index) => (
                  // Limits are keyed by component type: name each one as the
                  // offering does, and state the unit its amount is counted in.
                  <tr key={index}>
                    <td>
                      {getComponentLabel(
                        key,
                        row.requested_offering_components,
                      )}
                    </td>
                    <td>
                      {formatComponentQuantity(
                        value,
                        findQuantityComponent(
                          row.requested_offering_components,
                          key,
                        ),
                      )}
                    </td>
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
const TableTitle = ({ single }: { single: boolean }) => (
  <Badge
    variant="info"
    size="lg"
    leftIcon={<CubeIcon weight="bold" />}
    rightIcon={
      <Tooltip
        label={
          single
            ? translate(
                'This call uses predefined resource templates. Choose one of the templates below. Custom resource configurations are not allowed.',
              )
            : translate(
                'This call uses predefined resource templates. You can only select from the available templates below. Custom resource configurations are not allowed.',
              )
        }
        autoWidth
        contentClassName="max-w-[350px]"
      >
        <QuestionIcon weight="bold" size={16} className="w-full" />
      </Tooltip>
    }
    shape="pill"
    tone="outline"
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

const TEMPLATE_FIELD = 'template';

// Compared by uuid: a reloaded call brings new template objects, and an
// identity check would reset an unsaved choice to the saved one.
const sameTemplateChoice = (a, b) =>
  a?.[TEMPLATE_FIELD]?.uuid === b?.[TEMPLATE_FIELD]?.uuid;

/**
 * Hands the radio choice up to the step, which saves and prices it.
 *
 * Not through the table selection: its select-all action toggles, so setting
 * the same row twice clears it, and Save would then delete the saved request.
 */
const ReportSingleChoice = ({
  onChange,
}: {
  onChange: (template?: CallResourceTemplate) => void;
}) => {
  const { input } = useField(TEMPLATE_FIELD, { subscription: { value: true } });
  useEffect(() => {
    onChange(input.value || undefined);
  }, [input.value, onChange]);
  return null;
};

export const ResourceRequestTemplates: FC<ResourceRequestTemplatesProps> = ({
  call,
  proposal,
  reviews,
  change,
}) => {
  const dispatch = useDispatch();
  const single = call.resource_template_selection_mode === 'single';

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
  const queryClient = useQueryClient();

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
    // The summary panel reads every request through a query of its own. This
    // list is the only thing that reloads on a template-based call, so it is
    // the only place that knows the summary has fallen behind.
    queryClient.invalidateQueries({
      queryKey: ['ProposalResourcesSummary', proposal.uuid],
    });
  }, [data, change, queryClient, proposal.uuid]);

  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createClientPaginatedFetcher(call.resource_templates),
  });

  // Get selected rows from table state
  const tableState = useSelector(getTableState(TABLE_ID));
  const selectedRows: CallResourceTemplate[] = tableState?.selectedRows || [];
  const [singleChoice, setSingleChoice] = useState<CallResourceTemplate>();
  // The form keeps the object it was given; read the call's current one, so a
  // template edited since prices and saves as it is now.
  const currentChoice = useMemo(
    () =>
      singleChoice &&
      call.resource_templates?.find(
        (template) => template.uuid === singleChoice.uuid,
      ),
    [singleChoice, call.resource_templates],
  );
  // What Save and the cost total work from: the radio choice in single mode,
  // the ticked rows otherwise.
  const chosenTemplates = useMemo(
    () => (single ? (currentChoice ? [currentChoice] : []) : selectedRows),
    [single, currentChoice, selectedRows],
  );

  // Templates the saved requests were made from.
  const savedTemplates = useMemo(
    () =>
      (call.resource_templates || []).filter((template) =>
        (data ?? []).some(
          (resource: RequestedResource) =>
            resource.call_resource_template === template.url,
        ),
      ),
    [data, call.resource_templates],
  );

  // Initialize selection with existing resources when data loads. Single mode
  // restores through the radio form's initial values instead.
  useEffect(() => {
    if (
      !single &&
      savedTemplates.length > 0 &&
      tableState?.selectedRows?.length === 0
    ) {
      dispatch(selectAllRows(TABLE_ID, savedTemplates));
    }
  }, [savedTemplates, single, dispatch]);

  // Restores a draft's saved choice into the radio group.
  const singleInitialValues = useMemo(
    () => ({ [TEMPLATE_FIELD]: savedTemplates[0] }),
    [savedTemplates],
  );

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
    chosenTemplates,
    initialResources as RequestedResource[],
  );

  const table = (
    <Table<CallResourceTemplate>
      {...tableProps}
      // Render all templates: the header select-all checkbox replaces the
      // selection with the visible rows, so paginating would silently drop
      // pre-selected templates on other pages and delete their resource
      // requests on save.
      rows={call.resource_templates || []}
      hasPagination={false}
      enableMultiSelect={!single}
      fieldType={single ? 'radio' : undefined}
      fieldName={single ? TEMPLATE_FIELD : undefined}
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
      title={<TableTitle single={single} />}
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
        <BaseButton
          onClick={saveSelections as any}
          label={translate('Save')}
          iconNode={<CheckCircleIcon weight="bold" />}
          // A single-template call needs one chosen: saving none would only
          // remove the request the proposal cannot be submitted without.
          disabled={(!newCount && !removedCount) || (single && !currentChoice)}
          disabledReason={
            single && !currentChoice
              ? translate('Choose a template first')
              : translate('No changes to save')
          }
          pending={isPending}
          className="min-w-[125px]"
          variant="tertiary"
          size="lg"
        />
      }
      expandableRow={ExpandableRow}
      footer={
        <>
          {/* What the proposal would cost is what is selected, not what the
              call offers — an unselected template is not being asked for. */}
          <ProposalCostTotal rows={chosenTemplates.map(templateAsRequest)} />
          <FieldReviewComments
            reviews={reviews}
            fieldName="comment_resource_requests"
            space={0}
            className="mt-4"
          />
        </>
      }
    />
  );

  // A request with no template of the call behind it predates the rule that
  // a template call takes only its templates, or lost its template since. It
  // has no row to show it by, and the proposal cannot be submitted with it.
  const requestWithoutTemplate = (data ?? []).some(
    (resource: RequestedResource) =>
      !savedTemplates.some(
        (template) => template.url === resource.call_resource_template,
      ),
  );
  // The backend keeps a single-template proposal to one request, so several
  // means a draft from before the rule or one edited outside the form.
  const severalRequests = single && (data?.length ?? 0) > 1;
  // Saving keeps the chosen templates and removes every other request, which
  // should not happen unannounced.
  const warning = severalRequests
    ? {
        title: translate('This proposal holds several resource requests'),
        body: translate(
          'This call allows one template per proposal. Choose the one to keep: saving removes the other requests.',
        ),
      }
    : requestWithoutTemplate && single
      ? {
          title: translate(
            "This proposal's resource request is not from a template",
          ),
          body: translate(
            'This call allows one template per proposal. Choosing a template and saving replaces that request.',
          ),
        }
      : requestWithoutTemplate
        ? {
            title: translate('Some resource requests are not from a template'),
            body: translate(
              'This call only accepts its resource templates. Tick the templates you need and save: the other requests are removed.',
            ),
          }
        : null;
  // One shape whether or not the warning shows: a table that remounts clears
  // its selection, and Save would then remove every ticked request.
  const content = (
    <>
      {warning ? (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-3"
          title={warning.title}
          body={warning.body}
        />
      ) : null}
      {table}
    </>
  );
  if (!single) {
    return content;
  }
  // A form of its own: the radio column binds to a final-form field, and the
  // choice is saved by the table's Save button, not by the proposal form.
  return (
    <Form
      onSubmit={() => undefined}
      initialValues={singleInitialValues}
      initialValuesEqual={sameTemplateChoice}
      render={() => (
        <>
          <ReportSingleChoice onChange={setSingleChoice} />
          {content}
        </>
      )}
    />
  );
};
