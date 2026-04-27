import { FC } from 'react';
import { ReviewerSuggestion } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface ReviewerProfileDialogProps {
  resolve: {
    suggestion: ReviewerSuggestion;
  };
}

const formatScore = (score: number | null | undefined) => {
  if (score === null || score === undefined) return '-';
  return `${Math.round(score * 100)}%`;
};

export const ReviewerProfileDialog: FC<ReviewerProfileDialogProps> = ({
  resolve,
}) => {
  const { suggestion } = resolve;

  return (
    <ModalDialog
      title={translate('Reviewer profile')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="d-flex flex-column gap-4">
        {/* Header with name and email */}
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-light-primary text-primary"
            style={{ width: 64, height: 64, fontSize: 24 }}
          >
            {suggestion.reviewer_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h4 className="mb-1">{suggestion.reviewer_name}</h4>
            <div className="text-muted">{suggestion.reviewer_email}</div>
          </div>
        </div>

        {/* Biography */}
        {suggestion.reviewer_biography && (
          <div>
            <h6 className="text-muted mb-2">{translate('Biography')}</h6>
            <p className="mb-0">{suggestion.reviewer_biography}</p>
          </div>
        )}

        {/* Affinity Scores */}
        <div>
          <h6 className="text-muted mb-2">{translate('Match scores')}</h6>
          <div className="d-flex gap-4">
            <div>
              <div className="text-muted small">{translate('Affinity')}</div>
              <div className="fs-4 fw-bold text-success">
                {formatScore(suggestion.affinity_score)}
              </div>
            </div>
            <div>
              <div className="text-muted small">{translate('Keywords')}</div>
              <div className="fs-4 fw-bold">
                {formatScore(suggestion.keyword_score)}
              </div>
            </div>
            <div>
              <div className="text-muted small">{translate('Text')}</div>
              <div className="fs-4 fw-bold">
                {formatScore(suggestion.text_score)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};
