import { FieldArray } from 'react-final-form-arrays';

import { translate } from '@/i18n';

import { FormGroup } from '../../FormGroup';

import { CascadeStepsGroup } from './CascadeStepsGroup';

export const ConditionalCascadeConfiguration = () => {
  return (
    <FormGroup
      label={translate('Cascade Configuration')}
      description={translate(
        'Configure the steps and dependencies for the conditional cascade',
      )}
    >
      <FieldArray name="cascade_config.steps" component={CascadeStepsGroup} />
    </FormGroup>
  );
};
