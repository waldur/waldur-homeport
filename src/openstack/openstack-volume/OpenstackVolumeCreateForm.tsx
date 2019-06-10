import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { ENV } from '@waldur/core/services';
import { getLatinNameValidators, required } from '@waldur/core/validators';
import { NumberField, TextField, StringField, FormContainer, SelectField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { parseIntField } from '@waldur/marketplace/common/utils';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadVolumeAvailabilityZones } from '../api';

const validateSize = (value: number) => value < 1024 || value > 1024 * 4096 ?
  translate('Size should be between 1 and 4096 GB.') : undefined;

export class OpenstackVolumeCreateForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    this.props.initialize({ attributes: {size: 1024, ...this.props.initialAttributes} });
  }
  render() {
    return (
      <Query loader={loadVolumeAvailabilityZones} variables={this.props.offering.scope_uuid}>
      {({ loading, data, error }) => {
        if (loading) {
          return <LoadingSpinner/>;
        }
        if (error) {
          return <h3>{translate('Unable to load offering details.')}</h3>;
        }
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
                min={1}
                max={4096}
                format={v => v ? v / 1024 : ''}
                normalize={v => Number(v) * 1024}
                unit={translate('GB')}
                validate={validateSize}
              />
              {data.length > 0 && (
                <SelectField
                  label={translate('Availability zone')}
                  name="attributes.availability_zone"
                  options={data}
                  labelKey="name"
                  valueKey="url"
                  simpleValue={true}
                  required={ENV.plugins.WALDUR_OPENSTACK_TENANT.REQUIRE_AVAILABILITY_ZONE}
                  validate={ENV.plugins.WALDUR_OPENSTACK_TENANT.REQUIRE_AVAILABILITY_ZONE ? required : undefined}
                />
              )}
              <TextField
                label={translate('Description')}
                name="attributes.description"
                maxLength={500}
              />
            </FormContainer>
          </form>
        );
      }}
    </Query>
    );
  }
}
