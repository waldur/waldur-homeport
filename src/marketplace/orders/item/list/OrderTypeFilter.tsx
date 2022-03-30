import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const OrderTypeFilter: FunctionComponent = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('Type')}</Form.Label>
    <Field
      name="type"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select type...')}
          options={[
            { value: 'Create', label: translate('Create') },
            { value: 'Update', label: translate('Update') },
            { value: 'Terminate', label: translate('Terminate') },
          ]}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
        />
      )}
    />
  </Form.Group>
);
