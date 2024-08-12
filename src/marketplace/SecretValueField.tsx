import { Eye, EyeSlash } from '@phosphor-icons/react';
import classNames from 'classnames';
import React from 'react';
import { Form } from 'react-bootstrap';
import { useToggle } from 'react-use';

import { translate } from '@waldur/i18n';

interface SecretValueFieldProps {
  value: string;
  className?: string;
}

export const SecretValueField: React.FC<SecretValueFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);

  return (
    <div className={classNames('has-password', props.className)}>
      <Form.Control
        readOnly={true}
        value={props.value}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
      />
      <button
        className="text-btn password-icon"
        type="button"
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      >
        {!showSecret ? <Eye /> : <EyeSlash />}
      </button>
    </div>
  );
};
