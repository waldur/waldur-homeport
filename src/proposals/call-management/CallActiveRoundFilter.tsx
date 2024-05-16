import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';

export const CallActiveRoundFilter: FunctionComponent = () => (
  <Field
    name="has_active_round"
    component={(fieldProps) => (
      <AwesomeCheckbox
        label={translate('Active round')}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
      />
    )}
  />
);
