import React from 'react';
import { useAsync } from 'react-use';

import { getLocations } from '@waldur/azure/common/api';
import { CreateSelectField } from '@waldur/azure/common/CreateSelectField';
import { sqlServerName } from '@waldur/azure/common/validators';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

const loadData = (settings_uuid: string) =>
  getLocations(settings_uuid).then((locations) => ({ locations }));

export const AzureSQLServerForm: React.FC<OfferingConfigurationFormProps> = (
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
          label={translate('SQL server name')}
          name="attributes.name"
          description={translate(
            'This name will be visible in accounting data.',
          )}
          validate={[required, sqlServerName]}
          required={true}
        />
        {CreateSelectField(
          translate('Location'),
          'attributes.location',
          value.locations,
        )}
        <TextField
          label={translate('SQL server description')}
          name="attributes.description"
        />
      </FormContainer>
    </form>
  );
};
