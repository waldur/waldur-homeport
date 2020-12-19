import { FunctionComponent } from 'react';

import { FormContainer } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

export const OfferingPluginOptionsForm: FunctionComponent<{ container }> = ({
  container,
}) => {
  return (
    <FormContainer {...container}>
      <AwesomeCheckboxField
        name="auto_approve_in_service_provider_projects"
        label={translate('Auto approve in service provider projects')}
      />
    </FormContainer>
  );
};
