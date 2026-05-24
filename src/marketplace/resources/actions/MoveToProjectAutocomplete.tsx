import { FunctionComponent } from 'react';

import { required } from '@/core/validators';
import { AsyncSelectField } from '@/form/select/AsyncSelectField';
import { translate } from '@/i18n';
import { moveToProjectAutocomplete } from '@/marketplace/common/autocompletes';

interface MoveToProjectAutocompleteProps {
  isDisabled: boolean;
}

export const MoveToProjectAutocomplete: FunctionComponent<
  MoveToProjectAutocompleteProps
> = ({ isDisabled }) => (
  <AsyncSelectField
    name="project"
    label={translate('Move to project')}
    validate={required}
    required={true}
    placeholder={translate('Select project...')}
    loadOptions={moveToProjectAutocomplete}
    getOptionValue={(option) => option.url}
    getOptionLabel={(option) => `${option.customer_name} / ${option.name}`}
    noOptionsMessage={() => translate('No projects')}
    isDisabled={isDisabled}
  />
);
