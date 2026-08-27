import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { ReadOnlyFormControl } from '@/form/ReadOnlyFormControl';
import { BaseTextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { publicCallKey } from '@/proposals/callQueries';
import { showsProposalDuration } from '@/proposals/presentation';
import { Proposal, ProposalReview } from '@/proposals/types';
import { renderFieldOrDash } from '@/table/utils';

import { CommentSection } from './CommentSection';
import { DocumentationFiles } from './DocumentationFiles';
import { getFieldStates, shouldRenderField } from './proposalFields';

interface ProjectDetailsSummaryProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
  onAddCommentClick?({ commentField, label }): void;
}

const FIELD_CONFIG_FIELDS = ['proposal_field_config'] as const;

export const ProjectDetailsSummary: FC<ProjectDetailsSummaryProps> = ({
  proposal,
  reviews,
  onAddCommentClick,
}) => {
  // Which fields this call asked for. Same fetch as ProjectDetailsStep, so the
  // two share a React Query cache entry when both are on screen.
  const { data: call } = useQuery({
    queryKey: publicCallKey(proposal.call_uuid, FIELD_CONFIG_FIELDS),
    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: proposal.call_uuid },
        query: { field: FIELD_CONFIG_FIELDS },
      }).then((response) => response.data),
    enabled: !!proposal.call_uuid,
    refetchOnWindowFocus: false,
  });

  const fieldStates = useMemo(
    () => getFieldStates(call?.proposal_field_config),
    [call],
  );

  return (
    <AccordionCard
      id="step-project"
      title={translate('Project details')}
      subtitle={translate('Basic information about your research project.')}
      defaultOpen={false}
    >
      <CommentSection
        label={translate('Name')}
        valueField="name"
        commentField="comment_project_title"
        tooltip={translate(
          'Short title for the project, which explains the project goal as much as possible.',
        )}
        proposal={proposal}
        onAddCommentClick={onAddCommentClick}
        reviews={reviews}
      />

      {shouldRenderField(
        fieldStates,
        'project_summary',
        proposal.project_summary,
      ) && (
        <CommentSection
          label={translate('Summary')}
          valueField="project_summary"
          commentField="comment_project_summary"
          tooltip={translate('Brief description of the project.')}
          onAddCommentClick={onAddCommentClick}
          reviews={reviews}
          proposal={proposal}
        />
      )}

      {shouldRenderField(fieldStates, 'description', proposal.description) && (
        <CommentSection
          label={translate('Description')}
          valueField="description"
          commentField="comment_project_description"
          tooltip={translate(
            'Explanation of the scientific case of the project for which the resources are intended to be used.',
          )}
          onAddCommentClick={onAddCommentClick}
          reviews={reviews}
          proposal={proposal}
        >
          {(props) => (
            <BaseTextField solid value={props.value} readOnly disabled />
          )}
        </CommentSection>
      )}

      {shouldRenderField(
        fieldStates,
        'science_sub_domain',
        proposal.science_sub_domain,
      ) && (
        <ReadOnlyFormControl
          label={translate('Science domain')}
          value={renderFieldOrDash(
            proposal.science_sub_domain_name
              ? [proposal.science_domain_name, proposal.science_sub_domain_name]
                  .filter(Boolean)
                  .join(' > ')
              : null,
          )}
          tooltip={translate('Main research field of the project.')}
          actions={
            <div style={{ width: 42.5 }}>
              {/* Dummy spacing to align with other fields. */}
            </div>
          }
        />
      )}

      {showsProposalDuration() && (
        <CommentSection
          label={translate('Project duration in days')}
          valueField="duration_in_days"
          commentField="comment_project_duration"
          tooltip={translate(
            'Expected project duration in days once resources have been granted.',
          )}
          onAddCommentClick={onAddCommentClick}
          reviews={reviews}
          proposal={proposal}
        />
      )}

      {proposal.supporting_documentation?.length > 0 && (
        <CommentSection
          label={translate('Supporting documentation')}
          valueField="supporting_documentation"
          commentField="comment_project_supporting_documentation"
          tooltip={translate(
            'Upload additional documents, which support the proposal and help to review it.',
          )}
          onAddCommentClick={onAddCommentClick}
          reviews={reviews}
          proposal={proposal}
          spaceless
        >
          <DocumentationFiles files={proposal.supporting_documentation} />
        </CommentSection>
      )}
    </AccordionCard>
  );
};
