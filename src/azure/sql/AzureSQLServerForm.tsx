import React from 'react';

import { sqlServerName } from '@waldur/azure/common/validators';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadLocationOptions } from '../vm/utils';

export const AzureSQLServerForm: React.FC<OfferingConfigurationFormProps> = (
  props,
) => {
  return (
    <form>
      <FormContainer submitting={false}>
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
        <AsyncSelectField
          name="attributes.location"
          label={translate('Location')}
          required={true}
          loadOptions={(query, prevOptions, currentPage) =>
            loadLocationOptions(
              props.offering.scope_uuid,
              query,
              prevOptions,
              currentPage,
            )
          }
        />
        <TextField
          label={translate('SQL server description')}
          name="attributes.description"
        />
      </FormContainer>
    </form>
  );
};
