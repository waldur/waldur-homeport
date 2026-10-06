import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProposalsStepChecklistResponsesList } from 'waldur-js-client';

import { AccordionCard, Badge } from 'waldur-ui';

import { formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal } from '@/proposals/types';

import { ReviewComment } from './create-review/ReviewComment';
import { TECHNICAL_ASSESSMENT_STEP } from './technicalAssessmentAccess';

// Map a technical reviewer's decision to a semantic badge colour.
const getDecisionVariant = (label: string | null | undefined) => {
  const value = (label ?? '').toLowerCase();
  if (value.includes('condition')) return 'warning';
  if (value.includes('accept')) return 'success';
  if (value.includes('reject')) return 'danger';
  return 'secondary';
};

interface TechnicalAssessmentSectionProps {
  proposal: Proposal;
  /**
   * Whether the viewer may read the assessments at all (see
   * canViewTechnicalAssessment). A reviewer may not, and asking would only
   * be refused.
   */
  enabled: boolean;
}

// Threaded read-only view of every technical reviewer's assessment. Hidden
// from a viewer who may not read it, and until an assessment is submitted.
// Reviewers submit their own decision via the step checklist
// (StepChecklistSection); this section is the call manager's (and, when
// configured, the applicant's) consolidated view.
export const TechnicalAssessmentSection: FC<
  TechnicalAssessmentSectionProps
> = ({ proposal, enabled }) => {
  const { data: groups } = useQuery({
    queryKey: ['ProposalTechnicalAssessment', proposal.uuid],
    queryFn: () =>
      proposalProposalsStepChecklistResponsesList({
        path: { uuid: proposal.uuid },
        query: { step: TECHNICAL_ASSESSMENT_STEP },
      })
        .then((response) => response.data ?? [])
        .catch(() => []),
    refetchOnWindowFocus: false,
    enabled,
  });

  if (!enabled || !groups || groups.length === 0) {
    return null;
  }

  return (
    <AccordionCard
      id="step-technical-assessment"
      title={
        usesCallVocabulary()
          ? translate('Technical assessment decisions')
          : translate('Provider feedback')
      }
      subtitle={
        usesCallVocabulary()
          ? translate('Feasibility decisions from the technical reviewers.')
          : translate('Feasibility decisions from the service provider.')
      }
    >
      <div className="d-flex flex-column gap-4">
        {groups.map((group) => {
          const decision = group.answers.find(
            (answer) => answer.question_type === 'single_select',
          );
          const comments = group.answers.filter(
            (answer) => answer.question_type !== 'single_select',
          );
          return (
            <ReviewComment
              key={group.user_uuid}
              title={group.user_full_name}
              image={group.user_image}
              time={
                group.submitted_at ? formatRelative(group.submitted_at) : null
              }
            >
              {decision?.answer_display && (
                <div className="mt-1">
                  <Badge variant={getDecisionVariant(decision.answer_display)}>
                    {decision.answer_display}
                  </Badge>
                </div>
              )}
              {comments
                .filter((comment) => comment.answer_display)
                .map((comment) => (
                  <p
                    key={comment.question_uuid}
                    className="mb-0 mt-2 fw-normal text-gray-800"
                  >
                    {comment.answer_display}
                  </p>
                ))}
            </ReviewComment>
          );
        })}
      </div>
    </AccordionCard>
  );
};
