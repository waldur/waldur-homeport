import { createFilter } from 'react-select/dist/react-select.cjs.dev';
import { Field } from 'redux-form';

import * as api from '@waldur/auth/saml2/api';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const ProviderField = () => (
  <Field
    name="provider"
    component={(fieldProps) => (
      <AsyncPaginate
        loadOptions={(query, prevOptions, { page }) =>
          api.getSaml2IdentityProviders(query, prevOptions, page)
        }
        placeholder={translate('Select organization...')}
        noOptionsMessage={() => translate('No results found')}
        defaultOptions
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={fieldProps.input.onChange}
        filterOptions={createFilter({
          ignoreAccents: false,
        })}
      />
    )}
  />
);
