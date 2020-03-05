import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const getStates = () => [
  { value: 'Creating', label: translate('Unconfirmed') },
  { value: 'OK', label: translate('Accepted') },
  { value: 'Terminated', label: translate('Rejected') },
];

export const BookingStateFilter = () => (
  <div className="form-group">
    <label className="control-label">{translate('State')}</label>
    <Field
      name="state"
      component={fieldProps => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
          multi={true}
        />
      )}
    />
  </div>
);
