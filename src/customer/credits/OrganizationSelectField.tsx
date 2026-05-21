import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { Select } from '@/form/AsyncSelectField';
import { FormGroup } from '@/form/FormGroup';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

interface OrganizationSelectFieldProps {
  isDisabled?: boolean;
}

export const OrganizationSelectField: FC<OrganizationSelectFieldProps> = ({
  isDisabled,
}) => {
  return (
    <Field
      name="customer"
      label={translate('Organization')}
      validate={required}
      required
      component={FormGroup}
    >
      <Select
        loadOptions={(query, prevOptions, page) =>
          organizationAutocomplete(query, prevOptions, page, {
            field: ['name', 'uuid', 'url'],
          })
        }
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        noOptionsMessage={() => translate('No organizations')}
        isDisabled={isDisabled}
      />
    </Field>
  );
};
