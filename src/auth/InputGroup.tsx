import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { useCallback, FunctionComponent } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { useToggle } from 'react-use';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

import '@waldur/form/SecretField.scss';

const PasswordField = ({ placeholder, input, autoFocus = false }) => {
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

export const InputGroup: FunctionComponent<{
  fieldName;
  placeholder;
  type;
  autoFocus?: boolean;
}> = ({ fieldName, placeholder, type, autoFocus }) => {
  const renderComponent = useCallback(
    ({ input }) =>
      type === 'password' ? (
        <PasswordField
          placeholder={placeholder}
          input={input}
          autoFocus={autoFocus}
        />
      ) : (
        <StringField
          className="login-input"
          type={type}
          placeholder={placeholder}
          autoFocus={autoFocus}
          {...input}
        />
      ),

    [placeholder, type, autoFocus],
  );

  return <Field name={fieldName} component={renderComponent} />;
};
