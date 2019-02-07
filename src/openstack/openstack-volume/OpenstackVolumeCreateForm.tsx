import * as React from 'react';
import { Field } from 'redux-form';

import { getLatinNameValidators } from '@waldur/core/validators';
import { NumberField, TextField, StringField } from '@waldur/form-react';
import { renderValidationWrapper } from '@waldur/form-react/FieldValidationWrapper';
import { translate } from '@waldur/i18n';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { CreateResourceFormGroup } from '@waldur/openstack/CreateResourceFormGroup';

export class OpenstackVolumeCreateForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    this.props.initialize({ attributes: {size: 1024, ...this.props.initialAttributes} });
  }
  render() {
    return (
      <form className="form-horizontal">
        <CreateResourceFormGroup
          label={translate('Volume name')}
          required={true}>
          <Field
            name="attributes.name"
            component={renderValidationWrapper(StringField)}
            validate={getLatinNameValidators()}
          />
        </CreateResourceFormGroup>
        <CreateResourceFormGroup label={translate('Size')}>
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
        </CreateResourceFormGroup>
        <CreateResourceFormGroup label={translate('Description')}>
          <Field
            name="attributes.description"
            component={fieldProps =>
              <TextField
                maxLength={500}
                {...fieldProps.input}
              />
            }
          />
        </CreateResourceFormGroup>
      </form>
    );
  }
}
