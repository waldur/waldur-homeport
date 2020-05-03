import * as React from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/services';

import { AuthButtonText } from '../AuthButtonText';

import { loginSaml2 } from './store/actions';

export const AuthSaml2Button = ({ mode }) => {
  const dispatch = useDispatch();
  const providerLabel = ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_LABEL;
  const login = () => {
    dispatch({
      type: loginSaml2.REQUEST,
      payload: {
        'identity-provider': {
          url: ENV.plugins.WALDUR_AUTH_SAML2.IDENTITY_PROVIDER_URL,
        },
      },
    });
  };

  return (
    <div className="m-b-sm">
      <button type="button" className="btn btn-saml2 btn-block" onClick={login}>
        <i className="fa fa-university" aria-hidden="true"></i>{' '}
        <AuthButtonText mode={mode} provider={providerLabel} />
      </button>
    </div>
  );
};
