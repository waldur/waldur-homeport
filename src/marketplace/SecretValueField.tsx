import classNames from 'classnames';
import React from 'react';
import { Form } from 'react-bootstrap';
import { useToggle } from 'react-use';

interface SecretValueFieldProps {
  value: string;
  className?: string;
}

export const SecretValueField: React.FC<SecretValueFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);

  const iconClass = classNames('fa password-icon', {
    'fa-eye-slash': showSecret,
    'fa-eye': !showSecret,
  });

  return (
    <div className={classNames('has-password', props.className)}>
      <Form.Control
        readOnly={true}
        value={props.value}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
      />
      <a
        className={iconClass}
        title={showSecret ? 'Hide' : 'Show'}
        onClick={onToggle}
      />
    </div>
  );
};
