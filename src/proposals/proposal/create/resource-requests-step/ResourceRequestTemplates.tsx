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

import { Badge } from '@waldur/core/Badge';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { FieldReviewComments } from '@waldur/proposals/proposal/create-review/FieldReviewComments';
import { ProposalReview } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';
import { selectAllRows } from '@waldur/table/actions';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { getTableState } from '@waldur/table/selectors';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { useSubmitProposalResourcesFromTemplates } from '../utils';

interface ResourceRequestTemplatesProps {
  call: PublicCall;
  proposal: Proposal;
  title: string;
  reviews?: ProposalReview[];
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
}) => {
  const dispatch = useDispatch();

  // Fetch existing resources for this proposal
  const { data: initialResources = [] } = useQuery({
    queryKey: ['proposalResources', proposal.uuid],
    queryFn: () =>
      proposalProposalsResourcesList({ path: { uuid: proposal.uuid } }).then(
        (r) => r.data,
      ),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: () =>
      Promise.resolve({
        rows: call.resource_templates,
      }),
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
