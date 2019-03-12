import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

const getStates = () => [
  {value: 'pending', label: translate('Pending')},
  {value: 'executing', label: translate('Executing')},
  {value: 'done', label: translate('Done')},
  {value: 'erred', label: translate('Erred')},
  {value: 'terminated', label: translate('Terminated')},
];

export const OrderStateFilter = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('State')}
    </label>
    <Field
      name="state"
      component={fieldProps => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);
