import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { userAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const UserAutocomplete = () => (
  <Field
    name="user"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select user...')}
        loadOptions={userAutocomplete}
        defaultOptions
        getOptionValue={({ url }) => url}
        getOptionLabel={({ full_name }) => full_name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No users')}
        isClearable={true}
        additional={{
          page: 1,
        }}
      />
    )}
  />
);
