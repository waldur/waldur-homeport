import { CheckCircleIcon, CubeIcon, QuestionIcon } from '@phosphor-icons/react';
import { startCase } from 'lodash-es';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { CallResourceTemplate, Proposal, PublicCall } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { FieldReviewComments } from '@waldur/proposals/proposal/create-review/FieldReviewComments';
import { ProposalReview } from '@waldur/proposals/types';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
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
      variant="info"
      size="lg"
      pill
      outline
      className="ms-3"
    >
      {translate('Template based')}
    </Badge>
  </>
);

export const ResourceRequestTemplates: FC<ResourceRequestTemplatesProps> = ({
  call,
  proposal,
  title,
  reviews,
}) => {
  const tableProps = useTable({
    table: 'ProposalResourceTemplatesList',
    fetchData: () =>
      Promise.resolve({
        rows: call.resource_templates,
      }),
  });

  const {
    save: saveSelections,
    newCount,
    removedCount,
    isPending,
  } = useSubmitProposalResourcesFromTemplates(proposal);

  return (
    <Table<CallResourceTemplate>
      {...tableProps}
      fieldName="resources"
      fieldType="checkbox"
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
        <Button
          disabled={(!newCount && !removedCount) || isPending}
          onClick={saveSelections as any}
          className="min-w-125px"
        >
          <span className="svg-icon svg-icon-2">
            {isPending ? (
              <LoadingSpinnerIcon />
            ) : (
              <CheckCircleIcon weight="bold" />
            )}
          </span>
          {translate('Save')}
        </Button>
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
