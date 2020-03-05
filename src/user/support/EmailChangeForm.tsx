import * as React from 'react';

import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

import { useEmailChange } from './useEmailChange';

export const EmailChangeForm = ({ user }: { user: UserDetails }) => {
  const { handleSubmit, submitting, email, setEmail } = useEmailChange(user);

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      {user.requested_email && (
        <div className="form-group">
          <label htmlFor="emailAddress">{translate('Requested e-mail')}</label>
          <p className="form-control-static">{user.requested_email}</p>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="emailAddress">{translate('New e-mail address')}</label>
        <input
          type="email"
          id="emailAddress"
          className="form-control"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
      </div>
      <SubmitButton
        disabled={!email || submitting}
        submitting={submitting}
        label={translate('Verify e-mail')}
      />
    </form>
  );
};
