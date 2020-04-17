import * as classNames from 'classnames';
import * as React from 'react';
import useToggle from 'react-use/lib/useToggle';

interface SecretValueFieldProps {
  value: string;
  className?: string;
}

export const SecretValueField: React.FC<SecretValueFieldProps> = props => {
  const [showSecret, onToggle] = useToggle(false);

  const iconClass = classNames('fa password-icon', {
    'fa-eye-slash': showSecret,
    'fa-eye': !showSecret,
  });

  return (
    <div className={classNames('has-password', props.className)}>
      <input
        readOnly={true}
        value={props.value}
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        className="form-control"
      />
      <a
        className={iconClass}
        title={showSecret ? 'Hide' : 'Show'}
        onClick={onToggle}
      />
    </div>
  );
};
