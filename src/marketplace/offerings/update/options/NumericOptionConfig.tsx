import { PublicOfferingDetails } from 'waldur-js-client';

import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

import { ValidatorConfiguration } from './ValidatorConfiguration';

interface NumericOptionConfigProps {
  offering?: PublicOfferingDetails;
}

export const NumericOptionConfig = ({ offering }: NumericOptionConfigProps) => (
  <>
    <NumberGroup label={translate('Minimal value')} name="min" type="number" />
    <NumberGroup label={translate('Maximal value')} name="max" type="number" />
    <ValidatorConfiguration offering={offering} />
  </>
);
