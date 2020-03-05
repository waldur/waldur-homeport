import * as React from 'react';

import { SecretField, StringField, FormContainer } from '@waldur/form-react';

export const JiraForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      label={translate('Backend URL')}
      description={translate('JIRA host (e.g. https://jira.example.com/)')}
      name="backend_url"
      required={true}
    />
    <StringField
      label={translate('Username')}
      description={translate('JIRA user with excessive privileges')}
      name="username"
      required={true}
    />
    <SecretField
      label={translate('Password')}
      name="password"
      required={true}
    />
  </FormContainer>
);
