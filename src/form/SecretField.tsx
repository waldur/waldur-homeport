import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import React from 'react';
import { Form } from 'react-bootstrap';
import { useToggle } from 'react-use';

import { translate } from '@waldur/i18n';

import { FormField } from './types';

import './SecretField.scss';

interface SecretFieldProps extends FormField {
  placeholder?: string;
  maxLength?: number;
  solid?: boolean;
  className?: string;
}

export const SecretField: React.FC<SecretFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, solid, className, ...rest } = props;

  return (
    <div className={'has-password' + (className ? ` ${className}` : '')}>
      <Form.Control
        {...props.input}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={props.placeholder}
        className={solid ? 'form-control-solid' : undefined}
        {...rest}
      />

      <button
        className="password-icon text-btn"
        type="button"
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      >
        {showSecret ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
        &nbsp;
      </button>
    </div>
  );
};
