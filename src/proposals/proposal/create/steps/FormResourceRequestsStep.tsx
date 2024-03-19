import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { Proposal, ProposalFormStepProps } from '@waldur/proposals/types';
import { Table } from '@waldur/table';
import { ActionButton } from '@waldur/table/ActionButton';
import { useTable } from '@waldur/table/utils';

import { AddResourceButton } from './AddResourceButton';

export const FormResourceRequestsStep = (props: ProposalFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: () =>
      Promise.resolve({
        rows: proposal.resources,
        resultCount: proposal.resources.length,
      }),
  });

  return (
    <StepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          <AddResourceButton
            proposal={props.params.proposal}
            refetch={props.params.refetch}
          />
        </div>
      }
    >
      <Table
        {...tableProps}
        hasActionBar={false}
        fullWidth
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.offering_name}</>,
          },
          {
            title: translate('Provider'),
            render: ({ row }) => <>{row.provider_name}</>,
          },
          {
            title: translate('Category'),
            render: ({ row }) => <>{row.category}</>,
          },
        ]}
        title={translate('Offering requests')}
        verboseName={translate('Offering requests')}
        hoverableRow={() => (
          <>
            <ActionButton
              title={translate('Edit')}
              action={null}
              variant="primary"
            />
            <ActionButton title={translate('Remove')} action={null} />
          </>
        )}
      />
    </StepCard>
  );
};
