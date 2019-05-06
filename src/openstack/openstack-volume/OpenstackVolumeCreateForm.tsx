import * as React from 'react';

import { getLatinNameValidators } from '@waldur/core/validators';
import { NumberField, TextField, StringField, FormContainer } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { formatIntField, parseIntField } from '@waldur/marketplace/common/utils';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

const validateSize = (value: number) => value < 1 || value > 4096 ?
  translate('Size should be between 1 and 4096 GB.') : undefined;

export class OpenstackVolumeCreateForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    this.props.initialize({ attributes: {size: 1, ...this.props.initialAttributes} });
  }
  render() {
    return (
      <form className="form-horizontal">
        <FormContainer
          submitting={this.props.submitting}
          labelClass="col-sm-3"
          controlClass="col-sm-9">
          <ProjectField/>
          <StringField
            label={translate('Volume name')}
            required={true}
            name="attributes.name"
            validate={getLatinNameValidators()}
          />
          <NumberField
            label={translate('Size')}
            name="attributes.size"
            parse={parseIntField}
            format={formatIntField}
            min={1}
            max={4096}
            unit={translate('GB')}
            validate={validateSize}
          />
          <TextField
            label={translate('Description')}
            name="attributes.description"
            maxLength={500}
          />
        </FormContainer>
      </form>
    );
  }
}
