import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { TextGroup } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const WizardFormThirdPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  const { values, submitting } = useFormState({
    subscription: { values: true, submitting: true },
  });
  const { offering } = values;

  return (
    <WizardForm {...props}>
      <div className="size-lg">
        <p>
          {translate(
            'Are you sure you want to request {provider} to add {offering} to the {call}?',
            {
              provider: (
                <span className="fst-italic">{offering.customer_name}</span>
              ),

              offering: <u>{offering.name}</u>,
              call: props.data.call?.name,
            },
            formatJsxTemplate,
          )}
        </p>
        <TextGroup
          name="description"
          placeholder={translate('Add a note to the provider')}
          maxLength={1000}
          disabled={submitting}
        />
      </div>
    </WizardForm>
  );
};
