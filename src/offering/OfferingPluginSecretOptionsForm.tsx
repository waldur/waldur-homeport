import React from 'react';

import { FormContainer, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const OfferingPluginSecretOptionsForm = ({ container }) => (
  <FormContainer {...container}>
    <TextField
      name="template_confirmation_comment"
      label={translate('Confirmation notification template')}
    />
  </FormContainer>
);
