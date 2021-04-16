import { FunctionComponent } from 'react';

import { FormContainer, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

export const OfferingPluginSecretOptionsForm: FunctionComponent<{
  container;
}> = ({ container }) => (
  <FormContainer {...container}>
    <TextField
      name="template_confirmation_comment"
      label={translate('Confirmation notification template')}
    />
    <AwesomeCheckboxField
      name="service_provider_can_create_offering_user"
      label={translate('Allow service provider to create offering users.')}
      hideLabel={true}
    />
  </FormContainer>
);
