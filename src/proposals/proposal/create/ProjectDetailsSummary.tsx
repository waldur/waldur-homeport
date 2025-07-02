import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

import { CommentSection } from './CommentSection';
import { DocumentationFiles } from './DocumentationFiles';

interface ProjectDetailsSummaryProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
  onAddCommentClick?({ commentField, label }): void;
}

export const ProjectDetailsSummary: FC<ProjectDetailsSummaryProps> = ({
  proposal,
  reviews,
  onAddCommentClick,
}) => (
  <Card className="card-bordered" id="step-project">
    <Card.Header>
      <Card.Title>{translate('Project details')}</Card.Title>
    </Card.Header>
    <Card.Body>
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

      <CommentSection
        label={translate('Summary')}
        valueField="project_summary"
        commentField="comment_project_summary"
        tooltip={translate('Brief description of the project.')}
        onAddCommentClick={onAddCommentClick}
        reviews={reviews}
        proposal={proposal}
      />

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
        <TextField solid />
      </CommentSection>

      <CommentSection
        commentField="comment_project_has_civilian_purpose"
        valueField="project_has_civilian_purpose"
        onAddCommentClick={onAddCommentClick}
        reviews={reviews}
        proposal={proposal}
        inline
      >
        <AwesomeCheckboxField
          label={translate('Project for civilian purpose?')}
          tooltip={translate('Mark if the project has a civilian purpose.')}
          tooltipEnd
          alignMiddle
          className="flex-grow-1"
        />
      </CommentSection>

      <ReadOnlyFormControl
        label={translate('Research field (OECD code)')}
        value={proposal.oecd_fos_2007_label || 'N/A'}
        tooltip={translate('Select the main research field for the project.')}
        actions={
          <div style={{ width: 42.5 }}>
            {/* Dummy spacing to align with other fields. */}
          </div>
        }
      />

      <CommentSection
        valueField="project_is_confidential"
        commentField="comment_project_is_confidential"
        onAddCommentClick={onAddCommentClick}
        reviews={reviews}
        proposal={proposal}
        inline
      >
        <AwesomeCheckboxField
          label={translate('Is the project confidential?')}
          tooltip={translate(
            'Select if the project proposal contains confidential information.',
          )}
          tooltipEnd
          alignMiddle
          className="flex-grow-1"
        />
      </CommentSection>

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
    </Card.Body>
  </Card>
);
