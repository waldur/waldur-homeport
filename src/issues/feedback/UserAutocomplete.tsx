import { Field } from 'redux-form';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
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
        getOptionLabel={({ full_name, email, username }) =>
          full_name || email || username
        }
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No users')}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
