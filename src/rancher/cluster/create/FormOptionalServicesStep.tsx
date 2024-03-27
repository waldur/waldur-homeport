import { Field } from 'redux-form';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { FormGroup } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

export const FormOptionalServicesStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Optional')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <Field
        name="attributes.install_longhorn"
        component={FormGroup}
        hideLabel={true}
        description={
          <ExternalLink
            label={translate(
              'Longhorn is a lightweight, reliable, and powerful distributed block storage system for Kubernetes.',
            )}
            url="https://longhorn.io/docs/"
          />
        }
      >
        <AwesomeCheckboxField
          label={translate(
            'Deploy Longhorn block storage after cluster is deployed',
          )}
        />
      </Field>
    </VStepperFormStepCard>
  );
};
