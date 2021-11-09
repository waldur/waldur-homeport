import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

interface Option {
  value: string;
  label: string;
}

export const getStates = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
];

export const UserPermissionRequestsStateFilter: FunctionComponent = () => (
  <div className="form-group">
    <label className="control-label">{translate('State')}</label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isMulti={true}
          isClearable={true}
        />
      )}
    />
  </div>
);
