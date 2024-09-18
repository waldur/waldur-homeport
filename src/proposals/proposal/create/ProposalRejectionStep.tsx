import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { UsersListSummary } from '@waldur/proposals/team/UsersListSummary';
import { formatProposalState } from '@waldur/proposals/utils';

import { ProjectDetailsSummary } from './ProjectDetailsSummary';
import { RejectionSummary } from './RejectionSummary';
import { ResourceRequestsSummary } from './ResourceRequestsSummary';

export const ProposalRejectionStep: FC<{
  proposal;
  reviews?;
  refetch;
}> = ({ proposal, reviews }) => {
  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body>
        <RejectionSummary proposal={proposal} reviews={reviews} />
        <ProjectDetailsSummary proposal={proposal} reviews={reviews} />
        <ResourceRequestsSummary proposal={proposal} reviews={reviews} />
        <UsersListSummary
          scope={proposal}
          title={translate('Proposal')}
          reviews={reviews}
        />
      </SidebarLayout.Body>
      <SidebarLayout.Sidebar>
        <div className="mb-7">
          <h4>{proposal.name}</h4>
          <p className="text-muted fst-italic fs-8">UUID: {proposal.uuid}</p>
          <Badge variant="danger" outline pill>
            {formatProposalState(proposal.state)}
          </Badge>
        </div>

        <h6 className="fs-7">{translate('Application progress')}</h6>
        <FormSteps
          steps={[
            {
              label: translate('Decision'),
              id: 'step-decision',
              fields: ['decision'],
            },
            {
              label: translate('Archive'),
              id: 'step-archive',
            },
          ]}
          criticalErrors={{ decision: translate('Rejected') }}
          completedSteps={[false, false]}
        />
        <FloatingSubmitButton
          submitting={false}
          label={translate('Archive')}
          variant="secondary"
        />
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
