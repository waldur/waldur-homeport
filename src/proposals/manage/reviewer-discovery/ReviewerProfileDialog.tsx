import { FC } from 'react';
import { ReviewerSuggestion } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

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

  // The person in the dialog's own title, the rest as key/value rows.
  return (
    <ModalDialog
      title={suggestion.reviewer_name}
      subtitle={suggestion.reviewer_email}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('Biography')}
          value={suggestion.reviewer_biography}
          hideIfEmpty={false}
        />
        <PropertyItem
          label={translate('Affinity')}
          value={formatScore(suggestion.affinity_score)}
        />
        <PropertyItem
          label={translate('Keywords')}
          value={formatScore(suggestion.keyword_score)}
        />
        <PropertyItem
          label={translate('Text')}
          value={formatScore(suggestion.text_score)}
        />
      </PropertyList>
    </ModalDialog>
  );
};
