import * as React from 'react';
import { formValues, Field } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { ENV } from '@waldur/core/services';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  TextField,
  SelectField,
  NumberField,
  FieldError,
} from '@waldur/form-react';
import { StaticField } from '@waldur/form-react/StaticField';
import { translate } from '@waldur/i18n';
import {
  maxAmount,
  minAmount,
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadFormOptions } from './api';
import { connector } from './connector';

interface Template {
  cores: number;
  cores_per_socket: number;
  ram: number;
  disk: number;
}

const GuestOSField = formValues<any>({
  template: 'attributes.template',
})(props =>
  props.template ? (
    <StaticField
      label={translate('Guest OS')}
      value={props.template.guest_os_name}
    />
  ) : null,
);

interface Props extends OfferingConfigurationFormProps {
  variable: {
    settings_uuid: string;
    customer_uuid: string;
  };
}

const initAttributes = props => {
  React.useEffect(() => {
    const attributes = { ...props.initialAttributes };
    const initialData: Record<string, any> = { attributes };
    const activePlans = props.offering.plans.filter(
      plan => plan.archived === false,
    );
    if (props.plan) {
      initialData.plan = props.plan;
    } else if (activePlans.length > 0) {
      initialData.plan = activePlans[0];
    }
    if (props.data.templates.length > 0) {
      const template = props.data.templates[0];
      initialData.attributes.template = template;
      initialData.limits = {
        cpu: template.cores,
        ram: template.ram && template.ram / 1024,
        disk: template.disk && template.disk / 1024,
      };
      initialData.attributes.cores_per_socket = template.cores_per_socket;
    }
    props.initialize(initialData);
  }, []);
};

const StaticDiskField = props => {
  const diskValidator = React.useMemo(() => {
    const validators = [];
    if (props.limits.max_disk) {
      validators.push(maxAmount(props.limits.max_disk));
    }
    if (props.limits.max_disk_total) {
      validators.push(maxAmount(props.limits.max_disk_total));
    }
    return validators;
  }, [props.limits.max_disk, props.limits.max_disk_total]);

  return (
    <Field
      name="limits.disk"
      validate={diskValidator}
      component={fieldProps =>
        fieldProps.input.value ? (
          <>
            <StaticField
              label={translate('Storage size in GiB')}
              value={fieldProps.input.value}
              labelClass="col-sm-3"
              controlClass="col-sm-9"
            />
            <FieldError error={fieldProps.meta.error} />
          </>
        ) : null
      }
    />
  );
};

const minOne = minAmount(1);

const coresPerSocketValidator = (coresPerSocket, values) => {
  const cores = (values.limits && values.limits.cpu) || 1;
  if (cores % coresPerSocket !== 0) {
    return translate(
      'Number of CPU cores should be multiple of cores per socket.',
    );
  }
  return minOne(coresPerSocket);
};

const FormComponent = (props: any) => {
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;
  initAttributes(props);

  const limits = {
    max_cpu: props.data.limits.max_cpu,
    max_cores_per_socket: props.data.limits.max_cores_per_socket,
    max_ram: props.data.limits.max_ram && props.data.limits.max_ram / 1024,
    max_disk: props.data.limits.max_disk && props.data.limits.max_disk / 1024,
    max_disk_total:
      props.data.limits.max_disk_total &&
      props.data.limits.max_disk_total / 1024,
  };

  const cpuValidator = React.useMemo(
    () => (limits.max_cpu ? [minOne, maxAmount(limits.max_cpu)] : minOne),
    [limits.max_cpu],
  );

  const coresPerSocketLimitValidator = React.useMemo(() => {
    const validators = [minOne, coresPerSocketValidator];
    if (limits.max_cores_per_socket) {
      validators.push(maxAmount(limits.max_cores_per_socket));
    }
    return validators;
  }, [limits.max_cores_per_socket]);

  const ramValidator = React.useMemo(
    () => (limits.max_ram ? [minOne, maxAmount(limits.max_ram)] : minOne),
    [limits.max_ram],
  );

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
          validate={required}
          required={true}
        />
        <PlanField offering={props.offering} />
        {props.data.templates.length > 0 && (
          <SelectField
            label={translate('Template')}
            name="attributes.template"
            required={true}
            clearable={false}
            validate={required}
            options={props.data.templates}
            labelKey="name"
            valueKey="url"
            onChange={(value: Template) => {
              props.change('limits.cpu', value.cores);
              props.change('limits.ram', value.ram / 1024);
              props.change('limits.disk', value.disk / 1024);
              props.change(
                'attributes.cores_per_socket',
                value.cores_per_socket,
              );
            }}
          />
        )}
        <NumberField
          label={translate('Number of cores in a VM')}
          name="limits.cpu"
          min={1}
          validate={cpuValidator}
          parse={parseIntField}
          format={formatIntField}
        />
        <NumberField
          label={translate('Number of CPU cores per socket')}
          name="attributes.cores_per_socket"
          min={1}
          validate={coresPerSocketLimitValidator}
          parse={parseIntField}
          format={formatIntField}
        />
        <NumberField
          label={translate('Memory size in GiB')}
          name="limits.ram"
          validate={ramValidator}
          parse={parseIntField}
          format={formatIntField}
          min={1}
        />
        <StaticDiskField limits={limits} />
        <GuestOSField />
        {advancedMode && props.data.clusters.length > 0 && (
          <SelectField
            label={translate('Cluster')}
            name="attributes.cluster"
            options={props.data.clusters}
            labelKey="name"
            valueKey="url"
          />
        )}
        {advancedMode && props.data.datastores.length > 0 && (
          <SelectField
            label={translate('Datastore')}
            name="attributes.datastore"
            options={props.data.datastores}
            labelKey="name"
            valueKey="url"
          />
        )}
        {advancedMode && props.data.folders.length > 0 && (
          <SelectField
            label={translate('Folder')}
            name="attributes.folder"
            options={props.data.folders}
            labelKey="name"
            valueKey="url"
          />
        )}
        {advancedMode && props.data.networks.length > 0 && (
          <SelectField
            label={translate('Networks')}
            name="attributes.networks"
            options={props.data.networks}
            labelKey="name"
            valueKey="url"
            multi={true}
          />
        )}
        <TextField
          label={translate('Description')}
          name="attributes.description"
        />
      </FormContainer>
    </form>
  );
};

export const VMwareVirtualMachineForm = connector((props: Props) => (
  <Query variables={props.variable} loader={loadFormOptions}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner />;
      }
      if (error) {
        return <span>{translate('Unable to load form options.')}</span>;
      }
      return <FormComponent {...props} data={data} />;
    }}
  </Query>
));
