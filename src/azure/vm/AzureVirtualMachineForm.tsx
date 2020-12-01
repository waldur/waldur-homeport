import React from 'react';
import { useAsync } from 'react-use';

import { CreateSelectField } from '@waldur/azure/common/CreateSelectField';
import { virtualMachineName } from '@waldur/azure/common/validators';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadData } from './utils';

export const AzureVirtualMachineForm: React.FC<OfferingConfigurationFormProps> = (
  props,
) => {
  const { loading, error, value } = useAsync(
    () => loadData(props.offering.scope_uuid),
    [props.offering.scope_uuid],
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load locations.')}</>;
  }
  return (
    <form className="form-horizontal">
      <FormContainer
        submitting={false}
        labelClass="col-sm-3"
        controlClass="col-sm-9"
      >
        <ProjectField />
        <StringField
          label={translate('Name')}
          name="attributes.name"
          description={translate(
            'This name will be visible in accounting data.',
          )}
          validate={[required, virtualMachineName]}
          required={true}
        />
        {CreateSelectField(
          translate('Location'),
          'attributes.location',
          value.locations,
        )}
        {CreateSelectField(
          translate('Image'),
          'attributes.image',
          value.images,
        )}
        {CreateSelectField(translate('Size'), 'attributes.size', value.sizes)}
        <TextField
          label={translate('Description')}
          name="attributes.description"
        />
      </FormContainer>
    </form>
  );
};
