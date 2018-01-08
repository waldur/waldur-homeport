import * as React from 'react';

import { StringField, SelectField, FileUploadField, FormContainer} from '@waldur/form-react';

const AzureRegions = [
  'Central US',
  'East US 2',
  'South Central US',
  'North Europe',
  'East Asia',
  'Southeast Asia',
  'Japan West',
].map(region => ({label: region, value: region}));

export const AzureForm = ({ translate, container }) => (
  <FormContainer {...container}>
    <StringField
      name="username"
      label={translate('Subscription ID')}
      description={translate('In the format of GUID')}
      required={true}
    />
    <FileUploadField
      name="certificate"
      label={translate('Private certificate file')}
      description={translate('X509 certificate in .PEM format')}
      accept="application/x-x509-ca-cert"
      buttonLabel={translate('Browse')}
      required={true}
    />
    <StringField
      name="cloud_service_name"
      label={translate('Cloud service name')}
      description={translate('Cloud service group to assign all connected SPLs to')}
      required={true}
    />
    <SelectField
      name="location"
      label={translate('Location')}
      description={translate('Azure region where to provision resources (default: "Central US")')}
      options={AzureRegions}
    />
  </FormContainer>
);
