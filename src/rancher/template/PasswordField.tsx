import React from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { range } from '@/core/utils';
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
      <InputGroup>
        <FormControl {...fieldProps.input} />
        <BaseButton
          onClick={setGeneratedPassword}
          label={translate('Generate password')}
          variant="tertiary"
          size="lg"
        />
      </InputGroup>
    ),

    [setGeneratedPassword],
  );

  return <DecoratedField {...props} component={renderControl} />;
};
