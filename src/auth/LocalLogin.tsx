import { ArrowLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

import './LocalLogin.css';

import { SigninForm } from './SigninForm';

interface LocalLoginButtonProps {
  onClick: () => void;
}

interface LocalLoginFormProps {
  onBack?: () => void;
}

export const LocalLoginButton: FC<LocalLoginButtonProps> = ({ onClick }) => (
  <button
    type="button"
    className="btn btn-link login-with-local-account-button"
    onClick={onClick}
  >
    {translate('Sign in with local account')}
  </button>
);

export const LocalLoginForm: FC<LocalLoginFormProps> = ({ onBack }) => (
  <div className="local-login-form">
    <SigninForm />
    {onBack && (
      <button
        type="button"
        className="btn btn-link text-muted mt-2"
        onClick={onBack}
      >
        <ArrowLeftIcon className="me-2" weight="bold" />
        {translate('Back to all sign-in options')}
      </button>
    )}
  </div>
);
