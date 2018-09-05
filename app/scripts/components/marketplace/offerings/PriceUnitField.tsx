import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { PRICE_UNITS } from './constants';

export const PriceUnitField = withTranslation(props => (
  <Field
    name={`${props.plan}.unit`}
    component={fieldProps => (
      <Select
        value={fieldProps.input.value}
        onChange={value => fieldProps.input.onChange(value)}
        options={PRICE_UNITS}
      />
    )}
  />
));
