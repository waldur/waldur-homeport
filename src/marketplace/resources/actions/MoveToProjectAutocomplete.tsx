import { FunctionComponent } from 'react';

import { required } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { moveToProjectAutocomplete } from '@/marketplace/common/autocompletes';

export const MoveToProjectAutocomplete: FunctionComponent = () => (
  <AsyncSelectGroup
    name="project"
    label={translate('Move to project')}
    validate={required}
    required={true}
    placeholder={translate('Select project...')}
    loadOptions={moveToProjectAutocomplete}
    getOptionValue={(option) => option.url}
    getOptionLabel={(option) => `${option.customer_name} / ${option.name}`}
    noOptionsMessage={() => translate('No projects')}
  />
);
