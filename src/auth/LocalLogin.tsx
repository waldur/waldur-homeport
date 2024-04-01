import React, { Dispatch, SetStateAction, useState } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import './LocalLogin.css';

import { SigninForm } from './SigninForm';

interface LocalLoginProps {
  enableSeperator: boolean;
}

interface SigninWithLocalAccountProps {
  setShowForm: Dispatch<SetStateAction<boolean>>;
}

const Border = () => (
  <div
    className="login-separator-border"
    style={{
      borderBottomColor: ENV.plugins.WALDUR_CORE.BRAND_COLOR,
    }}
  />
);

const SignInWithLocalAccount: React.FC<SigninWithLocalAccountProps> = ({
  setShowForm,
}) => (
  <button
    type="button"
    className="login-with-local-account-button"
    onClick={() => setShowForm(true)}
  >
    {translate('Sign in with local account')}
  </button>
);

export const LocalLogin: React.FC<LocalLoginProps> = ({ enableSeperator }) => {
  const [showSigninForm, setShowSigninForm] = useState(false);
  return (
    <>
      {enableSeperator && (
        <div className="login-separator">
          <Border />
          <div className="login-separator-text">{translate('OR')}</div>
          <Border />
        </div>
      )}
      {!showSigninForm ? (
        <SignInWithLocalAccount setShowForm={setShowSigninForm} />
      ) : (
        <SigninForm />
      )}
    </>
  );
};

LocalLogin.defaultProps = {
  enableSeperator: false,
};
