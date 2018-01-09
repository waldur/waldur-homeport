import * as React from 'react';

import { StringField, FormContainer} from '@waldur/form-react';

export const AmazonForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="username"
      label={translate('Access key ID')}
      required={true}
    />
    <StringField
      name="token"
      label={translate('Secret access key')}
      required={true}
    />
  </FormContainer>
);
