import { Dispatch, FC, SetStateAction, useState } from 'react';

import { translate } from '@waldur/i18n';

import './LocalLogin.css';

import { SigninForm } from './SigninForm';

interface LocalLoginProps {
  enableSeperator: boolean;
}

interface SigninWithLocalAccountProps {
  setShowForm: Dispatch<SetStateAction<boolean>>;
}

const Border = () => <div className="login-separator-border" />;

const SignInWithLocalAccount: FC<SigninWithLocalAccountProps> = ({
  setShowForm,
}) => (
  <button
    type="button"
    className="btn btn-link login-with-local-account-button"
    onClick={() => setShowForm(true)}
  >
    {translate('Sign in with local account')}
  </button>
);

export const LocalLogin: FC<LocalLoginProps> = ({
  enableSeperator = false,
}) => {
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
