import * as React from 'react';

import { getLatinNameValidators } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

export const AzureSQLServerForm: React.SFC<OfferingConfigurationFormProps> = () => (
  <form className="form-horizontal">
    <FormContainer
      submitting={false}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      <ProjectField/>
      <StringField
        label={translate('SQL server name')}
        name="attributes.name"
        description={translate('This name will be visible in accounting data.')}
        validate={getLatinNameValidators()}
        required={true}
      />
      <TextField
        label={translate('SQL server description')}
        name="attributes.description"
      />
    </FormContainer>
  </form>
);
