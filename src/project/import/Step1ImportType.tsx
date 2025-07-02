import { FC } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { BoxRadioField } from '@waldur/marketplace/deploy/steps/BoxRadioField';

const choices = [
  {
    label: translate('Projects only'),
    value: 'projects_only',
    metadata: translate(
      'Import just project details without associated resources. Includes basic project metadata.',
    ),
  },
  {
    label: translate('Projects with resources'),
    value: 'projects_with_resources',
    metadata: translate(
      'Import projects along with their associated resources based on a selected offering type.',
    ),
  },
];

export const Step1ImportType: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => (
        <Field
          name="import_type"
          validate={[required]}
          component={BoxRadioField}
          choices={choices}
          vertical
          hasOptions={false}
          hasImage={false}
          rightRadio
          required
          onChange={(value) => {
            if (value !== wizardProps.formValues.import_type) {
              wizardProps.change('file', null);
            }
            if (value === 'projects_only') {
              wizardProps.change('offering', null);
            }
          }}
        />
      )}
    </WizardForm>
  );
};
