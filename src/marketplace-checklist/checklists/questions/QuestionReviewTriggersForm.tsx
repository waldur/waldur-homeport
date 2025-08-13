import { Field } from 'react-final-form';

import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const QuestionReviewTriggersForm = () => (
  <FormGroup
    label={translate('Review keywords (comma-separated)')}
    description={translate(
      'Text answers containing these keywords will be flagged for review',
    )}
  >
    <Field
      component={CommaSeparatedListField as any}
      name="review_answer_value"
    />
  </FormGroup>
);
