import { CommaSeparatedListGroup } from '@/form';
import { translate } from '@/i18n';

export const QuestionReviewTriggersForm = () => (
  <CommaSeparatedListGroup
    label={translate('Review keywords (comma-separated)')}
    description={translate(
      'Text answers containing these keywords will be flagged for review',
    )}
    name="review_answer_value"
  />
);
