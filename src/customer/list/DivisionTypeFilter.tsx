import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { divisionTypeAutocomplete } from '@waldur/customer/list/api';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const DivisionTypeFilter: FunctionComponent = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('Division type')}</Form.Label>
    <Field
      name="division_type"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select division type...')}
          loadOptions={divisionTypeAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No division types')}
          isMulti={true}
          isClearable={true}
          additional={{
            page: 1,
          }}
        />
      )}
    />
  </Form.Group>
);
