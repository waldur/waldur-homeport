import { Field } from 'redux-form';

import { FormGroup, TextField } from '@waldur/form';
import { StarRatingField } from '@waldur/form/StarRatingField';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

export const FormSummaryStep = (props: VStepperFormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Summary')}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <Field
        name="summary_score"
        component={FormGroup}
        label={translate('Final score')}
      >
        <StarRatingField />
      </Field>
      <Field
        name="summary_public_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Comments')}
        placeholder={translate('Add your comment here')}
      >
        <TextField />
      </Field>
      <Field
        name="summary_private_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Notes (not visible to user)')}
        placeholder={translate('Add your comment here')}
      >
        <TextField />
      </Field>
    </VStepperFormStepCard>
  );
};