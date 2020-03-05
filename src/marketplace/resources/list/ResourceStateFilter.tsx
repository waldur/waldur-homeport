import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

const getStates = () => [
  { value: 'Creating', label: translate('Creating') },
  { value: 'OK', label: translate('OK') },
  { value: 'Erred', label: translate('Erred') },
  { value: 'Updating', label: translate('Updating') },
  { value: 'Terminating', label: translate('Terminating') },
  { value: 'Terminated', label: translate('Terminated') },
];

export const ResourceStateFilter = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('State')}</label>
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
