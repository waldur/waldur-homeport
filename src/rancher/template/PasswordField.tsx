import generator from 'generate-password';
import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FieldProps } from '../types';

import { FORM_ID } from './constants';
import { DecoratedField } from './DecoratedField';

export const PasswordField: React.FC<FieldProps> = props => {
  const dispatch = useDispatch();

  const setGeneratedPassword = React.useCallback(() => {
    const password = generator.generate({
      length: 10,
      numbers: true,
    });

    dispatch(change(FORM_ID, `answers.${props.variable}`, password));
  }, [dispatch, props.variable]);

  const renderControl = React.useCallback(
    props => (
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
