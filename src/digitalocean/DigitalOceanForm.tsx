import { FunctionComponent } from 'react';

import { SecretField, FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const DigitalOceanForm: FunctionComponent<{ container }> = ({
  container,
}) => (
  <FormContainer {...container}>
    <SecretField
      name="token"
      label={translate('Access token')}
      required={true}
    />
  </FormContainer>
);
