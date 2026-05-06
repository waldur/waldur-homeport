import { Field } from 'react-final-form';
import { createFilter } from 'react-select';
import { apiAuthSaml2ProvidersList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';

const getSaml2IdentityProviders = async (
  name: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await apiAuthSaml2ProvidersList({
    query: {
      name,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const ProviderField = () => (
  <Field
    name="provider"
    component={(fieldProps) => (
      <AsyncPaginate
        loadOptions={(query, prevOptions, { page }) =>
          getSaml2IdentityProviders(query, prevOptions, page)
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
