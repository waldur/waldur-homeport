import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';
import { useToggle } from 'react-use';

import { translate } from '@/i18n';

import './SecretField.scss';

// ── Base (Pure UI) ──────────────────────────────────────

export interface BaseSecretFieldProps extends Omit<
  FormControlProps,
  'type' | 'autoComplete'
> {
  solid?: boolean;
}

export const BaseSecretField: FC<BaseSecretFieldProps> = ({
  solid,
  className,
  ...rest
}) => {
  const [showSecret, onToggle] = useToggle(false);

  return (
    <div className={classNames('has-password', className)}>
      <Form.Control
        type={showSecret ? 'text' : 'password'}
        autoComplete="new-password"
        className={solid ? 'form-control-solid' : undefined}
        {...rest}
      />

      <button
        className="password-icon text-btn"
        type="button"
        title={showSecret ? translate('Hide') : translate('Show')}
        onClick={onToggle}
      >
        {showSecret ? (
          <EyeSlashIcon size={18} weight="bold" />
        ) : (
          <EyeIcon size={18} weight="bold" />
        )}
        &nbsp;
      </button>
    </div>
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface SecretFieldProps extends Omit<
  BaseSecretFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta?: FieldRenderProps<any>['meta'];
}

export const SecretField: FC<SecretFieldProps> = ({ input, meta, ...rest }) => (
  <BaseSecretField
    isInvalid={meta?.touched && meta?.error}
    {...rest}
    {...input}
  />
);
