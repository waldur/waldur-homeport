import { Eye, EyeSlash } from '@phosphor-icons/react';
import React from 'react';
import { Form } from 'react-bootstrap';
import { useToggle } from 'react-use';

import { translate } from '@waldur/i18n';

import { FormField } from './types';

import './SecretField.scss';

interface SecretFieldProps extends FormField {
  placeholder?: string;
  maxLength?: number;
}

export const SecretField: React.FC<SecretFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;

  return (
    <div className="has-password">
      <Form.Control
        {...props.input}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={props.placeholder}
        className="form-control-solid"
        {...rest}
      />
      <button
        className="password-icon text-btn"
        type="button"
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      >
        {showSecret ? <EyeSlash size={18} /> : <Eye size={18} />}
        &nbsp;
      </button>
    </div>
  );
};
