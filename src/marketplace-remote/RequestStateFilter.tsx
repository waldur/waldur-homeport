import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export interface RequestStateFilterOption {
  value: string;
  label: string;
}

export const getStates = (): RequestStateFilterOption[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
  { value: 'canceled', label: translate('Canceled') },
];

export const RequestStateFilter: FunctionComponent = () => (
  <div className="form-group col-sm-3">
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
