import { FunctionComponent } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';

import { translate } from '@waldur/i18n';

const isEmpty = (value) =>
  value === '' || value === null || typeof value === 'undefined';

export const OptionalNumberField: FunctionComponent<WrappedFieldProps> = ({
  input,
}) =>
  isEmpty(input.value) ? (
    <Button onClick={() => input.onChange(0)}>{translate('Set value')}</Button>
  ) : (
    <>
      <InputGroup>
        <FormControl {...input} min={0} type="number" />
        <Button onClick={() => input.onChange(null)} variant="danger">
          {translate('Reset value')}
        </Button>
      </InputGroup>
    </>
  );
