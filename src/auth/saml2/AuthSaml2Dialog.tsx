import * as React from 'react';
import { Async } from 'react-select';
import { compose } from 'redux';
import { reduxForm, Field, InjectedFormProps } from 'redux-form';

import { fetchIdentityProviderOptions } from '@waldur/auth/saml2/utils';
import { $rootScope } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { connectAngularComponent } from '@waldur/store/connect';

import { loginSaml2 } from './store/actions';

export class AuthSaml2Dialog extends React.Component<InjectedFormProps> {

  constructor(props) {
    super(props);
    $rootScope.$broadcast('enableRequests');
  }

  identityProviderAutocomplete(input: string) {
    if (input && input.length > 0) {
      return fetchIdentityProviderOptions(input);
    } else {
      return Promise.resolve();
    }
  }

  render() {
    const { handleSubmit, invalid, submitting, pristine } = this.props;
    return (
    <form onSubmit={handleSubmit(loginSaml2)}>
      <div className="modal-header">
        <h3 className="modal-title">{translate('Please search for your organization')}</h3>
      </div>
      <div className="modal-body">
        <div className="saml-auth-form">
          <Field
            name="identity-provider"
            component={fieldProps => (
              <Async
                loadOptions={input => this.identityProviderAutocomplete(input)}
                placeholder={translate('Select organization...')}
                searchPromptText={translate('Type to search')}
                noResultsText={translate('No results found')}
                valueKey="url"
                labelKey="name"
                value={fieldProps.input.value}
                onChange={fieldProps.input.onChange}/>
            )}
          />
        </div>
      </div>
      <div className="modal-footer">
        <button disabled={invalid || submitting || pristine}
          type="submit"
          className="btn btn-success">
            {translate('Login')}
        </button>
        <CloseDialogButton />
      </div>
    </form>
    );
  }
}

const enhance = compose(
  reduxForm({
    form: 'authSaml2Search',
  })
);

export default connectAngularComponent(enhance(AuthSaml2Dialog));
