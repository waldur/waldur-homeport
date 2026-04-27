import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { Select } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

export const OrganizationGroup = ({ disabled }) => (
  <Form.Group className="mb-5 flex-equal">
    <Form.Label>{translate('Organization')}</Form.Label>
    <Field
      component={Select}
      name="customer"
      validate={!disabled ? [required] : undefined}
      defaultOptions
      loadOptions={(query, prevOptions, page) =>
        organizationAutocomplete(query, prevOptions, page, {
          field: ['name', 'uuid', 'url'],
          o: 'name',
        })
      }
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.uuid}
      isDisabled={disabled}
    />
  </Form.Group>
);
