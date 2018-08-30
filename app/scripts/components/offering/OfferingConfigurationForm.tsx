import * as React from 'react';

import { required, getLatinNameValidators } from '@waldur/core/validators';
import { FormContainer, TextField, StringField, SelectField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

export const OfferingConfigurationForm = (props: OfferingConfigurationFormProps) => (
  <form className="form-horizontal">
    <FormContainer
      submitting={false}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      <StringField
        name="attributes.name"
        label={translate('Name')}
        required={true}
        description={translate('This name will be visible in accounting data.')}
        validate={getLatinNameValidators()}
      />
      {props.offering.plans.length > 0 && (
        <SelectField
          name="plan"
          labelKey="name"
          valueKey="url"
          options={props.offering.plans}
          validate={required}
          label={translate('Plan')}
          required={true}
        />
      )}
      <TextField
        name="attributes.description"
        label={translate('Description')}
      />
      {props.offering.options.order.map(key => {
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
      })}
    </FormContainer>
  </form>
);
