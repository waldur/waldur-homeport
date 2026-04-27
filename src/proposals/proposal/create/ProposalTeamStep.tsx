import { AccordionCard } from '@/core/AccordionCard';
import { VStepperFormStepProps } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { TeamSection } from '@/proposals/team/TeamSection';
import { Proposal, ProposalReview } from '@/proposals/types';

import { StepHeaderContent } from './StepHeaderContent';

export const ProposalTeamStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const change = props.params?.change;
  const reviews: ProposalReview[] = props.params?.reviews;
  const values = props.params?.values;
  const isCompleted = props.params?.isCompleted;
  const isRequired = props.params?.isRequired;
  const isOpen = props.params?.isOpen;
  const onToggle = props.params?.onToggle;

  // Get team member count from form values
  const memberCount = values?.users?.length || 0;

  return (
    <AccordionCard
      id={props.id}
      title={translate('Project team')}
      subtitle={translate('Team members and their roles in the project.')}
      isOpen={isOpen}
      onToggle={onToggle}
      actions={
        <StepHeaderContent
          isCompleted={isCompleted}
          isRequired={isRequired}
          metadata={
            memberCount > 0
              ? translate('{count} members', { count: memberCount })
              : undefined
          }
        />
      }
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
