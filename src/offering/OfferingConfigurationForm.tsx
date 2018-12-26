import * as React from 'react';

import { required, getLatinNameValidators } from '@waldur/core/validators';
import { FormContainer, TextField, StringField, SelectField, NumberField } from '@waldur/form-react';
import { AwesomeCheckboxField } from '@waldur/form-react/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

export class OfferingConfigurationForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    const attributes = {};
    if (this.props.offering.options.order) {
      this.props.offering.options.order.forEach(key => {
        const options = this.props.offering.options.options[key];
        if (options && options.default !== undefined) {
          attributes[key] = options.default;
        }
      });
    }
    const initialData: any = {attributes};
    if (this.props.offering.plans.length === 1) {
      initialData.plan = this.props.offering.plans[0];
    }
    initialData.project = this.props.project;
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
            name="attributes.name"
            label={translate('Name')}
            required={true}
            description={translate('This name will be visible in accounting data.')}
            validate={getLatinNameValidators()}
          />
          <PlanField offering={props.offering}/>
          <PlanDetailsTable offering={props.offering}/>
          <TextField
            name="attributes.description"
            label={translate('Description')}
          />
          {props.offering.options.order && (props.offering.options.order.map(key => {
            const options = props.offering.options.options[key];
            if (!options) {
              return null;
            }
            let OptionField = StringField;
            let params = {};
            switch (options.type) {
              case 'text':
                OptionField = TextField;
                break;

              case 'select_string':
                OptionField = SelectField;
                const choices = options.choices.map(item => ({label: item, value: item}));
                params = {options: choices};
                break;

              case 'boolean':
                OptionField = AwesomeCheckboxField;
                params = {hideLabel: true};
                break;

              case 'integer':
                OptionField = NumberField;
                params = {
                  parse: parseIntField,
                  format: formatIntField,
                };
                break;
            }
            return (
              <OptionField
                key={key}
                label={options.label}
                name={`attributes.${key}`}
                tooltip={options.help_text}
                required={options.required}
                validate={options.required ? required : undefined}
                {...params}
              />
            );
          }))}
        </FormContainer>
      </form>
    );
  }
}
