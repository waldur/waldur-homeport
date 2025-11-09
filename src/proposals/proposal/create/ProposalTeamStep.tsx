import { AccordionCard } from '@waldur/core/AccordionCard';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { TeamSection } from '@waldur/proposals/team/TeamSection';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

export const ProposalTeamStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const change = props.params?.change;
  const reviews: ProposalReview[] = props.params?.reviews;

  // Check if proposal has compliance - collapse panels only if compliance exists
  const hasCompliance = !!proposal?.compliance_status;

  return (
    <AccordionCard
      id={props.id}
      title={translate('Project team')}
      subtitle={translate('Team members and their roles in the project.')}
      defaultOpen={!hasCompliance}
    >
      <TeamSection
        scope={proposal}
        roleTypes={['proposal']}
        title={null}
        change={change}
        reviews={reviews}
      />
    </AccordionCard>
  );
};
