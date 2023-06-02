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
    className="LoginSeparatorBorder"
    style={{
      borderBottomColor: ENV.plugins.WALDUR_CORE.BRAND_COLOR,
    }}
  />
);

const SignInWithLocalAccount: React.FC<SigninWithLocalAccountProps> = ({
  setShowForm,
}) => (
  <p className="LoginWithLocalAccountText" onClick={() => setShowForm(true)}>
    {translate('Sign in with local account')}
  </p>
);

export const LocalLogin: React.FC<LocalLoginProps> = ({ enableSeperator }) => {
  const [showSigninForm, setShowSigninForm] = useState(false);
  return (
    <>
      {enableSeperator && (
        <div className="LoginSeparator">
          <Border />
          <div className="LoginSeparatorText">{translate('OR')}</div>
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
