import * as React from 'react';

import { getLatinNameValidators } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  TextField,
} from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

export class AllocationForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    const { project, plan } = this.props;
    this.props.initialize({ ...this.props.initialAttributes, project, plan });
  }

  render() {
    const props = this.props;
    return (
      <form className="form-horizontal">
        <FormContainer
          submitting={false}
          labelClass="col-sm-3"
          controlClass="col-sm-9">
          <ProjectField/>
          <StringField
            label={translate('Allocation name')}
            name="attributes.name"
            description={translate('This name will be visible in accounting data.')}
            validate={getLatinNameValidators()}
            required={true}
          />
          <PlanField offering={props.offering}/>
          <PlanDetailsTable offering={props.offering}/>
          <TextField
            label={translate('Allocation description')}
            name="attributes.description"
          />
        </FormContainer>
      </form>
    );
  }
}
