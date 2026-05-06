import React from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentLimitEnableField: React.FC = () => (
  <FormGroup space={5}>
    <Field
      component={AwesomeCheckboxField as any}
      label={translate('Enable limit')}
      name="limit_amount"
      format={(v) => v !== null && typeof v != 'undefined'}
      parse={(v) => (v ? 0 : null)}
      size="sm"
      alignMiddle
    />
  </FormGroup>
);
