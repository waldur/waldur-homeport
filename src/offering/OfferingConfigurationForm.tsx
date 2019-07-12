import * as React from 'react';
import { connect } from 'react-redux';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { required, getLatinNameValidators } from '@waldur/core/validators';
import { FormContainer, TextField, StringField, SelectField, NumberField } from '@waldur/form-react';
import { AsyncSelectField } from '@waldur/form-react/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form-react/AwesomeCheckboxField';
import { CalendarField } from '@waldur/form-react/CalendarField';
import { DateField } from '@waldur/form-react/DateField';
import { TimeSelectField } from '@waldur/form-react/TimeSelectField';
import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { fetchTenantOptions, fetchInstanceOptions } from './api';

export class PureOfferingConfigurationForm extends React.Component<OfferingConfigurationFormProps> {

  state = {
    availableDates: [],
  };

  componentDidMount() {
    const attributes = {...this.props.initialAttributes};
    if (this.props.offering.options.order) {
      this.props.offering.options.order.forEach(key => {
        const options = this.props.offering.options.options[key];
        if (options && options.default !== undefined) {
          attributes[key] = options.default;
        }
      });
    }
    if (!attributes.schedules) {
      const { schedules } = this.props.offering.attributes;
      this.setState({ availableDates: schedules });
      attributes.schedules = [];
    }
    const initialData: any = {attributes};
    if (this.props.plan) {
      initialData.plan = this.props.plan;
    } else if (this.props.offering.plans.length === 1) {
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
              case 'date':
                OptionField = DateField;
                break;
              case 'time':
                OptionField = TimeSelectField;
                break;
              case 'select_openstack_tenant':
                OptionField = AsyncSelectField;
                params = {
                  loadOptions: query => fetchTenantOptions(query, props.customer.uuid),
                  placeholder: translate('Select tenant...'),
                };
                break;
              case 'select_openstack_instance':
                OptionField = AsyncSelectField;
                params = {
                  loadOptions: query => fetchInstanceOptions(query, props.customer.uuid),
                  placeholder: translate('Select instance...'),
                };
                break;
              case 'select_multiple_openstack_instances':
                OptionField = AsyncSelectField;
                params = {
                  loadOptions: query => fetchInstanceOptions(query, props.customer.uuid),
                  placeholder: translate('Select instance...'),
                  multi: true,
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
          {props.offering.type === OFFERING_TYPE_BOOKING &&
            <CalendarField
              name="attributes.schedules"
              excludedEvents={this.state.availableDates}
              label={translate('Select dates')}
            />
          }
        </FormContainer>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  customer: getCustomer(state),
});

const enhance = connect(mapStateToProps);

export const OfferingConfigurationForm = enhance(PureOfferingConfigurationForm);
