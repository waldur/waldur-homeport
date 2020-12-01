import classNames from 'classnames';
import React from 'react';
import { useToggle } from 'react-use';

import { FormField } from './types';

interface SecretFieldProps extends FormField {
  placeholder?: string;
}

export const SecretField: React.FC<SecretFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, ...rest } = props;
  const iconClass = classNames('fa password-icon', {
    'fa-eye-slash': showSecret,
    'fa-eye': !showSecret,
  });

  return (
    <div className="has-password">
      <input
        {...props.input}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        className="form-control"
        placeholder={props.placeholder}
        {...rest}
      />
      <a
        className={iconClass}
        title={showSecret ? 'Hide' : 'Show'}
        onClick={onToggle}
      />
    </div>
  );
};
