import { FC } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const getOrderStateFilterOption = () => [
  { value: 'pending', label: translate('Pending') },
  { value: 'executing', label: translate('Executing') },
  { value: 'done', label: translate('Done') },
  { value: 'erred', label: translate('Erred') },
  { value: 'terminated', label: translate('Terminated') },
];

export const OrderStateFilter: FC = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('State')}</label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getOrderStateFilterOption()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
        />
      )}
    />
  </div>
);
