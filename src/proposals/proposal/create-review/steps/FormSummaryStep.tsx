import ReactStars from 'react-rating-stars-component';
import { Field } from 'redux-form';

import { RATING_STAR_ACTIVE_COLOR } from '@waldur/core/constants';
import { FormGroup, TextField } from '@waldur/form';
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
        component={(fieldProps) => (
          <ReactStars
            count={5}
            size={24}
            edit={true}
            isHalf={false}
            activeColor={RATING_STAR_ACTIVE_COLOR}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
        label={translate('Final score')}
      />
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
