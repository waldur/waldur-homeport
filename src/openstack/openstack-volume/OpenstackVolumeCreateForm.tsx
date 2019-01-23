import * as React from 'react';
import { Field } from 'redux-form';

import { getLatinNameValidators } from '@waldur/core/validators';
import { StringField, NumberField, TextField } from '@waldur/form-react';
import { FieldValidationWrapper } from '@waldur/form-react/FieldValidationWrapper';
import { translate } from '@waldur/i18n';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import { OpenstackInstanceFormGroup } from '@waldur/openstack/openstack-instance/OpenstackInstanceCreateForm';

export class OpenstackVolumeCreateForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    this.props.initialize({ attributes: {size: 1024, ...this.props.initialAttributes} });
  }
  render() {
    return (
      <form className="form-horizontal">
        <OpenstackInstanceFormGroup
          label={translate('Volume name')}
          required={true}>
          <Field
            name="attributes.name"
            component={fieldProps =>
              <FieldValidationWrapper
                field={StringField}
                {...fieldProps}
              />
            }
            validate={getLatinNameValidators()}
          />
        </OpenstackInstanceFormGroup>
        <OpenstackInstanceFormGroup label={translate('Size')}>
            <div className="input-group" style={{maxWidth: 200}}>
              <Field
                name="attributes.size"
                component={fieldProps =>
                  <NumberField
                    min={0}
                    max={1 * 4096}
                    {...fieldProps.input}/>
                }
                format={v => v ? v / 1024 : 0}
                normalize={v => Number(v) * 1024}
              />
              <span className="input-group-addon">
                GB
              </span>
          </div>
        </OpenstackInstanceFormGroup>
        <OpenstackInstanceFormGroup label={translate('Description')}>
          <Field
            name="attributes.description"
            component={fieldProps =>
              <TextField
                maxLength={500}
                {...fieldProps.input}
              />
            }
          />
        </OpenstackInstanceFormGroup>
      </form>
    );
  }
}
