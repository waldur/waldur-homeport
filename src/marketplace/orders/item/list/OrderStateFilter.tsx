import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';

export const getOrderStateFilterOption = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'executing', label: translate('Executing') },
  { value: 'done', label: translate('Done') },
  { value: 'erred', label: translate('Erred') },
  { value: 'terminated', label: translate('Terminated') },
];

interface OrderStateFilterProps {
  options?: () => Option[];
}

export const OrderStateFilter: FunctionComponent<OrderStateFilterProps> = ({
  options,
}) => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('State')}</Form.Label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={options ? options() : getOrderStateFilterOption()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
        />
      )}
    />
  </Form.Group>
);
