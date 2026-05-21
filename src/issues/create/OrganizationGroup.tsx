import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

export const OrganizationGroup = ({ disabled }) => (
  <Field
    name="customer"
    component={FormGroup}
    label={translate('Organization')}
    validate={!disabled ? required : undefined}
    containerClassName="flex-equal"
  >
    <Select
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
  </Field>
);
