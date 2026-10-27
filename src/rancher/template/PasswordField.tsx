import React from 'react';
import { useForm } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { range } from '@/core/utils';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { FieldProps } from '../types';

import { DecoratedField } from './DecoratedField';

export function generatePassword(length) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getChar = () => chars.charAt(Math.floor(Math.random() * chars.length));
  return range(length).map(getChar).join('');
}

export const PasswordField: React.FC<FieldProps> = (props) => {
  const form = useForm();

  const setGeneratedPassword = React.useCallback(() => {
    const password = generatePassword(10);
    form.change(props.variable, password);
  }, [form, props.variable]);

  const renderControl = React.useCallback(
    (fieldProps) => (
      <div className="flex gap-1.5">
        <BaseInputField containerClassName="flex-1" {...fieldProps.input} />
        <BaseButton
          onClick={setGeneratedPassword}
          label={translate('Generate password')}
          variant="tertiary"
          size="lg"
        />
      </div>
    ),

    [setGeneratedPassword],
  );

  return <DecoratedField {...props} component={renderControl} />;
};
