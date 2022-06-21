import { createFilter } from 'react-select/dist/react-select.cjs.dev';
import { reduxForm, Field } from 'redux-form';

import { fetchIdentityProviderOptions } from '@waldur/auth/saml2/utils';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { loginSaml2 } from './store/actions';

export const AuthSaml2Dialog = reduxForm({
  form: 'authSaml2Search',
})(({ handleSubmit, invalid, submitting, pristine }) => (
  <form onSubmit={handleSubmit(loginSaml2)}>
    <div className="modal-header">
      <h3 className="modal-title">
        {translate('Please search for your organization')}
      </h3>
    </div>
    <div className="modal-body">
      <div className="saml-auth-form">
        <Field
          name="identity-provider"
          component={(fieldProps) => (
            <AsyncPaginate
              loadOptions={(query, prevOptions, { page }) =>
                fetchIdentityProviderOptions(query, prevOptions, page)
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
              additional={{
                page: 1,
              }}
            />
          )}
        />
      </div>
    </div>
    <div className="modal-footer">
      <button
        disabled={invalid || submitting || pristine}
        type="submit"
        className="btn btn-success"
      >
        {translate('Login')}
      </button>
      <CloseDialogButton />
    </div>
  </form>
));
