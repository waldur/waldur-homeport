import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const OrganizationGroup = ({ isDisabled }) => (
  <FormGroup label={translate('Organization')} required>
    <Field
      component={Select as any}
      name="customer"
      validate={required}
      placeholder={translate('Select...')}
      loadOptions={(query, prevOptions, page) =>
        organizationAutocomplete(query, prevOptions, page, {
          field: ['name', 'url', 'customer_unallocated_credit'],
          o: 'name',
        })
      }
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.url}
      noOptionsMessage={() => translate('No organizations')}
      isDisabled={isDisabled}
    />
  </FormGroup>
);
