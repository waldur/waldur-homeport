import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export interface BookingFilterStateOption {
  value: string;
  label: string;
}

export const getStates = (): BookingFilterStateOption[] => [
  { value: 'Creating', label: translate('Unconfirmed') },
  { value: 'OK', label: translate('Accepted') },
  { value: 'Terminated', label: translate('Rejected') },
];

export const BookingStateFilter: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('State')}</Form.Label>
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
  </Form.Group>
);
