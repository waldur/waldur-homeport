import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { useCallback, FunctionComponent } from 'react';
import { useToggle } from 'react-use';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import '@waldur/form/SecretField.scss';

const PasswordField = ({ placeholder, input }) => {
  const [showSecret, onToggle] = useToggle(false);

  return (
    <div className="has-password">
      <input
        className="login-input"
        type={showSecret ? 'text' : 'password'}
        placeholder={placeholder}
        {...input}
      />

      <button
        className="password-icon text-btn icon-align"
        type="button"
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      >
        {showSecret ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
        &nbsp;
      </button>
    </div>
  );
};

export const InputGroup: FunctionComponent<{
  fieldName;
  placeholder;
  type;
}> = ({ fieldName, placeholder, type }) => {
  const renderComponent = useCallback(
    ({ input }) =>
      type === 'password' ? (
        <PasswordField placeholder={placeholder} input={input} />
      ) : (
        <input
          className="login-input"
          type={type}
          placeholder={placeholder}
          {...input}
        />
      ),

    [placeholder, type],
  );

  return <Field name={fieldName} component={renderComponent} />;
};
