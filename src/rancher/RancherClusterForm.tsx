import * as React from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField, SelectField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { TenantSubnetAndFlavor } from './TenantSubnetAndFlavor';
import { rancherClusterName } from './utils';

const fetchTenants = projectId => getAll('/openstack-tenants/', {
  params: {
    project_uuid: projectId,
    field: ['name', 'url'],
  },
});

const getTenant = state => formValueSelector(FORM_ID)(state, 'attributes.tenant');

export const RancherClusterForm: React.FC<OfferingConfigurationFormProps> = props => {
  React.useEffect(() => {
    const { project, plan } = props;
    const initialData = {
      project,
      plan,
      attributes: {nodes: []},
      limits: {
        node: 0,
      },
    };
    if (!plan && props.offering.plans.length === 1) {
      initialData.plan = props.offering.plans[0];
    }
    props.initialize(initialData);
  }, []);

  const {state: tenantProps, call: loadTenants} = useQuery(fetchTenants, props.project.uuid);
  React.useEffect(loadTenants, []);

  const tenant = useSelector(getTenant);

  if (!tenantProps.loaded) {
    return <LoadingSpinner/>;
  }

  return (
    <form className="form-horizontal">
      <FormContainer
        submitting={props.submitting}
        labelClass="col-sm-3"
        controlClass="col-sm-9">
        <ProjectField/>
        <StringField
          label={translate('Cluster name')}
          name="attributes.name"
          description={translate('This name will be visible in accounting data.')}
          validate={[required, rancherClusterName]}
          required={true}
        />
        <PlanField offering={props.offering}/>
        <PlanDetailsTable
          offering={props.offering}
          limits={props.limits}
          viewMode={true}
        />
        <TextField
          label={translate('Cluster description')}
          name="attributes.description"
        />
        <SelectField
          label={translate('Tenant')}
          name="attributes.tenant"
          options={tenantProps.data}
          required={true}
          labelKey="name"
          valueKey="url"
          simpleValue={true}
        />
        <TenantSubnetAndFlavor tenant={tenant}/>
      </FormContainer>
    </form>
  );
};
