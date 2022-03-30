import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const SigninButton: FunctionComponent = () => {
  const router = useRouter();
  return (
    <Form.Group className="m-b-sm">
      <p>
        <small>{translate('Already have an account?')}</small>
      </p>
      <Button as="a" onClick={() => router.stateService.go('login')}>
        {translate('Login')}
      </Button>
    </Form.Group>
  );
};
