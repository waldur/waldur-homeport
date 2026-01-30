import { Field } from 'react-final-form';
import { PublicOfferingDetails } from 'waldur-js-client';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

import { ValidatorConfiguration } from './ValidatorConfiguration';

interface NumericOptionConfigProps {
  offering?: PublicOfferingDetails;
}

export const NumericOptionConfig = ({ offering }: NumericOptionConfigProps) => (
  <>
    <FormGroup label={translate('Minimal value')}>
      <Field name="min" type="number" component={InputField as any} />
    </FormGroup>
    <FormGroup label={translate('Maximal value')}>
      <Field name="max" type="number" component={InputField as any} />
    </FormGroup>
    <ValidatorConfiguration offering={offering} />
  </>
);
