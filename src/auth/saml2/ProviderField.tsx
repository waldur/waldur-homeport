import { Field } from 'react-final-form';
import { createFilter } from 'react-select';
import { apiAuthSaml2ProvidersList } from 'waldur-js-client';

import { createLoadOptions, AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';

const getSaml2IdentityProviders = createLoadOptions(
  apiAuthSaml2ProvidersList,
  'name',
);

export const ProviderField = () => (
  <Field
    name="provider"
    component={(fieldProps) => (
      <AsyncSelect
        loadOptions={getSaml2IdentityProviders}
        placeholder={translate('Select organization...')}
        noOptionsMessage={() => translate('No results found')}
        defaultOptions
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={fieldProps.input.onChange}
        filterOption={createFilter({
          ignoreAccents: false,
        })}
      />
    )}
  />
);
