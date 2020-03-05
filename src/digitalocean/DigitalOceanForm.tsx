import * as React from 'react';

import { SecretField, FormContainer } from '@waldur/form-react';

export const DigitalOceanForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <SecretField
      name="token"
      label={translate('Access token')}
      required={true}
    />
  </FormContainer>
);
