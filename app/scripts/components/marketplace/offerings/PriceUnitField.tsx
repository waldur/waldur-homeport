import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { PRICE_UNITS } from './constants';

export const PriceUnitField = withTranslation(props => (
  <div className="form-group">
    <label className="control-label col-sm-3">
      {props.translate('Billing period')}
    </label>
    <div className="col-sm-9">
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
    </div>
  </div>
));
