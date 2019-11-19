import * as React from 'react';
import { FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, TextField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { DEFAULT_CLUSTER_CONFIGURATION } from './constants';
import { NodeList } from './NodeList';
import { rancherClusterName } from './utils';

export class RancherClusterForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    const { project, plan } = this.props;
    const initialData = {
      project,
      plan,
      attributes: DEFAULT_CLUSTER_CONFIGURATION,
    };
    if (!plan && this.props.offering.plans.length === 1) {
      initialData.plan = this.props.offering.plans[0];
    }
    this.props.initialize(initialData);
  }

  render() {
    const props = this.props;
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
          <PlanDetailsTable offering={props.offering} limits={props.limits}/>
          <TextField
            label={translate('Cluster description')}
            name="attributes.description"
          />
          <FieldArray name="attributes.nodes" component={NodeList}/>
        </FormContainer>
      </form>
    );
  }
}
