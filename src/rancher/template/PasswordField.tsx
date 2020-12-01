import React from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { range } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { FieldProps } from '../types';

import { FORM_ID } from './constants';
import { DecoratedField } from './DecoratedField';

export function generatePassword(length) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getChar = () => chars.charAt(Math.floor(Math.random() * chars.length));
  return range(length).map(getChar).join('');
}

export const PasswordField: React.FC<FieldProps> = (props) => {
  const dispatch = useDispatch();

  const setGeneratedPassword = React.useCallback(() => {
    const password = generatePassword(10);

    dispatch(change(FORM_ID, `answers.${props.variable}`, password));
  }, [dispatch, props.variable]);

  const renderControl = React.useCallback(
    (props) => (
      <InputGroup>
        <FormControl {...props.input} />
        <InputGroup.Button>
          <Button onClick={setGeneratedPassword}>
            {translate('Generate password')}
          </Button>
        </InputGroup.Button>
      </InputGroup>
    ),
    [setGeneratedPassword],
  );

  return <DecoratedField {...props} component={renderControl} />;
};
