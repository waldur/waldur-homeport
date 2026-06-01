import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { useToggle } from 'react-use';

import { withFormGroup } from '@/form/withFormGroup';
import { translate } from '@/i18n';

import '@/form/SecretField.scss';

interface PasswordFieldProps {
  placeholder?: string;
  autoFocus?: boolean;
  input?: any;
}

const PasswordField: FC<PasswordFieldProps> = ({
  placeholder,
  input,
  autoFocus = false,
}) => {
  const [showSecret, onToggle] = useToggle(false);

  return (
    <div className="has-password">
      <FormControl
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={placeholder}
        className="login-input"
        autoFocus={autoFocus}
        {...input}
      />

      <button
        className="password-icon text-btn icon-align"
        type="button"
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      >
        {showSecret ? (
          <EyeSlashIcon size={20} weight="bold" />
        ) : (
          <EyeIcon size={20} weight="bold" />
        )}
        &nbsp;
      </button>
    </div>
  );
};

export const PasswordGroup = withFormGroup(PasswordField);
