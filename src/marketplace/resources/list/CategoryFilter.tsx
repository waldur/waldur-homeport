import React from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { categoryAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const CategoryFilter: React.FC = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('Category')}</Form.Label>
    <Field
      name="category"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select category...')}
          loadOptions={categoryAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.title}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No categories')}
          isClearable={true}
          additional={{
            page: 1,
          }}
        />
      )}
    />
  </Form.Group>
);
