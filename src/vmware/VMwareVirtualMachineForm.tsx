import * as React from 'react';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField, SelectField, NumberField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { GUEST_OS_CHOICES } from './constants';

export const VMwareVirtualMachineForm: React.SFC<OfferingConfigurationFormProps> = () => (
  <form className="form-horizontal">
    <FormContainer
      submitting={false}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      <ProjectField/>
      <StringField
        label={translate('Name')}
        name="attributes.name"
        description={translate('This name will be visible in accounting data.')}
        validate={required}
        required={true}
      />
      <SelectField
        label={translate('Guest OS')}
        name="attributes.guest_os"
        options={Object.keys(GUEST_OS_CHOICES).map(key => ({
          label: GUEST_OS_CHOICES[key],
          value: key,
        }))}
        required={true}
        clearable={false}
        validate={required}
        simpleValue={true}
      />
      <NumberField
        label={translate('Number of cores in a VM')}
        name="attributes.cores"
      />
      <NumberField
        label={translate('Number of CPU cores per socket')}
        name="attributes.cores_per_socket"
      />
      <NumberField
        label={translate('Memory size in MiB')}
        name="attributes.ram"
      />
      <TextField
        label={translate('Description')}
        name="attributes.description"
      />
    </FormContainer>
  </form>
);
