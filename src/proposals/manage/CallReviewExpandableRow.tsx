import { FunctionComponent } from 'react';
import { ProposalReview } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RateStars } from '@waldur/proposals/proposal/create-review/RateStars';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

interface CallReviewExpandableRowProps {
  row: ProposalReview;
}

const SectionHeader: FunctionComponent<{
  title: string;
  className?: string;
}> = ({ title, className }) => (
  <div className={`field-row ${className || ''}`}>
    <div className="border-bottom pb-2 mb-2">
      <strong>{title}</strong>
    </div>
  </div>
);

export const CallReviewExpandableRow: FunctionComponent<
  CallReviewExpandableRowProps
> = ({ row }) => {
  const hasFieldComments =
    row.comment_project_title ||
    row.comment_project_summary ||
    row.comment_project_description ||
    row.comment_project_duration ||
    row.comment_project_is_confidential ||
    row.comment_project_has_civilian_purpose ||
    row.comment_project_supporting_documentation ||
    row.comment_resource_requests ||
    row.comment_team;

  return (
    <ExpandableContainer asTable>
      <Field
        label={translate('Score')}
        value={
          row.summary_score ? (
            <div className="d-flex align-items-center gap-2">
              <RateStars value={row.summary_score} size={18} />
              <span className="text-muted">({row.summary_score}/5)</span>
            </div>
          ) : (
            '-'
          )
        }
      />
      <Field
        label={translate('Public comment')}
        value={renderFieldOrDash(row.summary_public_comment)}
      />
      <Field
        label={translate('Private comment')}
        value={renderFieldOrDash(row.summary_private_comment)}
      />
      <Field label={translate('Created')} value={formatDateTime(row.created)} />
      {row.modified !== row.created && (
        <Field
          label={translate('Last modified')}
          value={formatDateTime(row.modified)}
        />
      )}

      {hasFieldComments && (
        <>
          <SectionHeader title={translate('Field comments')} className="mt-4" />
          {row.comment_project_title && (
            <Field
              label={translate('Project title')}
              value={row.comment_project_title}
            />
          )}
          {row.comment_project_summary && (
            <Field
              label={translate('Project summary')}
              value={row.comment_project_summary}
            />
          )}
          {row.comment_project_description && (
            <Field
              label={translate('Project description')}
              value={row.comment_project_description}
            />
          )}
          {row.comment_project_duration && (
            <Field
              label={translate('Project duration')}
              value={row.comment_project_duration}
            />
          )}
          {row.comment_project_is_confidential && (
            <Field
              label={translate('Confidentiality')}
              value={row.comment_project_is_confidential}
            />
          )}
          {row.comment_project_has_civilian_purpose && (
            <Field
              label={translate('Civilian purpose')}
              value={row.comment_project_has_civilian_purpose}
            />
          )}
          {row.comment_project_supporting_documentation && (
            <Field
              label={translate('Supporting documentation')}
              value={row.comment_project_supporting_documentation}
            />
          )}
          {row.comment_resource_requests && (
            <Field
              label={translate('Resource requests')}
              value={row.comment_resource_requests}
            />
          )}
          {row.comment_team && (
            <Field label={translate('Team')} value={row.comment_team} />
          )}
        </>
      )}
    </ExpandableContainer>
  );
};
