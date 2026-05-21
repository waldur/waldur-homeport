import { Field } from 'react-final-form';

import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const QuestionReviewTriggersForm = () => (
  <FormGroup
    label={translate('Review keywords (comma-separated)')}
    description={translate(
      'Text answers containing these keywords will be flagged for review',
    )}
  >
    <Field component={CommaSeparatedListField} name="review_answer_value" />
  </FormGroup>
);
