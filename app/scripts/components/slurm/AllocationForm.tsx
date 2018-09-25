import * as React from 'react';

import { required, getLatinNameValidators } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  TextField,
  SelectField,
} from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { PlanDetailsTable } from '@waldur/marketplace/details/PlanDetailsTable';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

export class AllocationForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    const project = this.props.project;
    this.props.initialize({ project });
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
          {props.offering.plans && (
            <SelectField
              label={translate('Plan')}
              name="plan"
              labelKey="name"
              valueKey="url"
              options={props.offering.plans}
              validate={required}
              required={true}
              clearable={false}
            />
          )}
          <PlanDetailsTable/>
          <TextField
            label={translate('Allocation description')}
            name="attributes.description"
          />
        </FormContainer>
      </form>
    );
  }
}
