import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { InputGroup } from './InputGroup';

export const DomainGroup: FunctionComponent = () => {
  const user = useSelector(getUser);
  if (user.is_staff) {
    return (
      <InputGroup
        name="domain"
        label={translate('Home organization domain name')}
        component={InputField}
      />
    );
  } else {
    return (
      <Form.Group>
        <Form.Label>{translate('Home organization domain name')}</Form.Label>
        <Form.Control plaintext>
          <strong>{user.organization || 'N/A'}</strong>
        </Form.Control>
      </Form.Group>
    );
  }
};
