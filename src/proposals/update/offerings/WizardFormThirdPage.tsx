import { FunctionComponent } from 'react';

import { FormContainer, TextField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { formatJsxTemplate, translate } from '@waldur/i18n';

export const WizardFormThirdPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { offering } = wizardProps.formValues;

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
            className="size-lg"
          >
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
            <TextField
              name="description"
              placeholder={translate('Add a note to the provider')}
              maxLength={1000}
            />
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
