import { Form } from 'react-bootstrap';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

import { useEmailChange } from './useEmailChange';

export const EmailChangeForm = ({ user }: { user: UserDetails }) => {
  const { handleSubmit, submitting, email, setEmail } = useEmailChange(user);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      {user.requested_email && (
        <Form.Group>
          <label htmlFor="emailAddress">{translate('Requested email')}</label>
          <p>{user.requested_email}</p>
        </Form.Group>
      )}
      <Form.Group>
        <label htmlFor="emailAddress">{translate('New email address')}</label>
        <Form.Control
          type="email"
          id="emailAddress"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Form.Group>
      <SubmitButton
        disabled={!email || submitting}
        submitting={submitting}
        label={translate('Verify email')}
      />
    </form>
  );
};
