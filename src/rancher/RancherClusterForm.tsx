import * as React from 'react';
import { useDispatch } from 'react-redux';
import { FieldArray, change } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import { loadSubnets } from '@waldur/openstack/api';

import { DEFAULT_CLUSTER_CONFIGURATION } from './constants';
import { NodeList } from './NodeList';
import { rancherClusterName } from './utils';

const fetchResource = serviceSettings => loadSubnets(serviceSettings)
  .then(subnets => subnets.map(subnet => ({
    label: `${subnet.network_name} / ${subnet.name} (${subnet.cidr})`,
    value: subnet.url,
  })));

export const RancherClusterForm: React.FC<OfferingConfigurationFormProps> = props => {
  React.useEffect(() => {
    const { project, plan } = props;
    const initialData = {
      project,
      plan,
      attributes: DEFAULT_CLUSTER_CONFIGURATION,
      limits: {
        node: 1,
      },
    };
    if (!plan && props.offering.plans.length === 1) {
      initialData.plan = props.offering.plans[0];
    }
    props.initialize(initialData);
  }, []);

  const {state: resourceProps, call: loadResource} = useQuery(fetchResource, props.offering.scope_uuid);
  React.useEffect(loadResource, []);

  const dispatch = useDispatch();
  const updateNodesCount = React.useCallback(nodes => {
    dispatch(change(FORM_ID, 'limits.node', nodes));
  }, []);

  if (!resourceProps.loaded) {
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
        <FieldArray
          name="attributes.nodes"
          component={NodeList}
          subnetChoices={resourceProps.data}
          onChange={updateNodesCount}
        />
      </FormContainer>
    </form>
  );
};
