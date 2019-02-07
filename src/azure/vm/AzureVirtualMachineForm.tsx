import * as React from 'react';

import { CreateSelectField } from '@waldur/azure/common/CreateSelectField';
import { virtualMachineName } from '@waldur/azure/common/validators';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadData } from './utils';

export const AzureVirtualMachineForm: React.SFC<OfferingConfigurationFormProps> = props => (
  <Query variables={props.offering.scope_uuid} loader={loadData}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <span>{translate('Unable to load locations.')}</span>;
      }
      return (
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
              validate={[required, virtualMachineName]}
              required={true}
            />
            {CreateSelectField(translate('Location'), 'attributes.location', data.locations)}
            {CreateSelectField(translate('Image'), 'attributes.image', data.images)}
            {CreateSelectField(translate('Size'), 'attributes.size', data.sizes)}
            <TextField
              label={translate('Description')}
              name="attributes.description"
            />
          </FormContainer>
        </form>
      );
    }}
  </Query>
);
