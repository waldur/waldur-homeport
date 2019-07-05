import * as React from 'react';
import { formValues } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField, SelectField, NumberField } from '@waldur/form-react';
import { StaticField } from '@waldur/form-react/StaticField';
import { translate } from '@waldur/i18n';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadFormOptions } from './api';
import { connector } from './connector';

interface Template {
  cores: number;
  cores_per_socket: number;
  ram: number;
}

const GuesOSField = formValues<any>({template: 'attributes.template'})(props => props.template ? (
  <StaticField
    label={translate('Guest OS')}
    value={props.template.guest_os_name}
  />
) : null);

interface Props extends OfferingConfigurationFormProps {
  variable: {
    settings_uuid: string;
    customer_uuid: string;
  };
}

export const VMwareVirtualMachineForm = connector((props: Props) => (
  <Query variables={props.variable} loader={loadFormOptions}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <span>{translate('Unable to load form options.')}</span>;
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
              validate={required}
              required={true}
            />
            <SelectField
              label={translate('Template')}
              name="attributes.template"
              required={true}
              clearable={false}
              validate={required}
              options={data.templates}
              labelKey="name"
              valueKey="url"
              onChange={(value: Template) => {
                props.change('attributes.cores', value.cores);
                props.change('attributes.cores_per_socket', value.cores_per_socket);
                props.change('attributes.ram', value.ram);
              }}
            />
            <GuesOSField/>
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
            <SelectField
              label={translate('Cluster')}
              name="attributes.cluster"
              required={true}
              clearable={false}
              validate={required}
              options={data.clusters}
              labelKey="name"
              valueKey="url"
            />
            <TextField
              label={translate('Description')}
              name="attributes.description"
            />
          </FormContainer>
        </form>
      );
    }}
  </Query>
));
