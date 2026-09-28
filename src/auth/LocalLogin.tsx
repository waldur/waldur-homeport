import { ArrowLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

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
  <BaseButton
    variant="text-primary"
    className="login-with-local-account-button"
    onClick={onClick}
    label={translate('Sign in with local account')}
  />
);

export const LocalLoginForm: FC<LocalLoginFormProps> = ({ onBack }) => (
  <div className="local-login-form">
    <SigninForm />
    {onBack && (
      <BaseButton
        variant="text-secondary"
        className="mt-2"
        onClick={onBack}
        iconNode={<ArrowLeftIcon weight="bold" />}
        label={translate('Back to all sign-in options')}
      />
    )}
  </div>
);
