import { FunctionComponent } from 'react';

import { FormContainer, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const OfferingPluginSecretOptionsForm: FunctionComponent<{
  container;
}> = ({ container }) => (
  <FormContainer {...container}>
    <TextField
      name="template_confirmation_comment"
      label={translate('Confirmation notification template')}
    />
  </FormContainer>
);
