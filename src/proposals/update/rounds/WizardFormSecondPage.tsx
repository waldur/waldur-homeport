import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

/**
 * The round's review duration, kept for existing rounds: a review is due
 * when the workflow step it contributes to is, and only a review whose step
 * has no deadline is still due this many days after it was created.
 */
export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { submitting } = useFormState({
    subscription: { submitting: true },
  });
  return (
    <WizardForm {...props}>
      <div>
        <NumberGroup
          label={translate('Review duration without a step deadline (days)')}
          name="review_duration_in_days"
          min={0}
          disabled={submitting}
          description={translate(
            "Reviews are due when their workflow step is: set step due dates on the round's Steps tab. This duration applies only to a review whose step has no deadline.",
          )}
        />
      </div>
    </WizardForm>
  );
};
