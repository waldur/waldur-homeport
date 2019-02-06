import * as React from 'react';

import { getLatinNameValidators } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

export const AzureVirtualMachineForm: React.SFC<OfferingConfigurationFormProps> = () => (
  <form className="form-horizontal">
    <FormContainer
      submitting={false}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      <ProjectField/>
      <StringField
        label={translate('Virtual machine name')}
        name="attributes.name"
        description={translate('This name will be visible in accounting data.')}
        validate={getLatinNameValidators()}
        required={true}
      />
      <TextField
        label={translate('Virtual machine description')}
        name="attributes.description"
      />
    </FormContainer>
  </form>
);
