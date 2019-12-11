import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { useQuery } from '@waldur/core/useQuery';
import { getLatinNameValidators, required } from '@waldur/core/validators';
import { NumberField, TextField, StringField, FormContainer, SelectField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { parseIntField } from '@waldur/marketplace/common/utils';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { loadVolumeAvailabilityZones, loadVolumeTypes } from '../api';
import { formatVolumeTypeChoices } from '../openstack-instance/utils';

const validateSize = (value: number) => value < 1024 || value > 1024 * 4096 ?
  translate('Size should be between 1 and 4096 GB.') : undefined;

const loadData = async settings => {
  const zones = await loadVolumeAvailabilityZones(settings);
  const volumeTypes = await loadVolumeTypes(settings);
  return {zones, volumeTypes: formatVolumeTypeChoices(volumeTypes)};
};

export const OpenstackVolumeCreateForm: React.FC<OfferingConfigurationFormProps> = props => {
  const {call, state} = useQuery(loadData, props.offering.scope_uuid);

  React.useEffect(() => {
    props.initialize({ attributes: {size: 1024, ...props.initialAttributes} });
    call();
  }, []);

  if (state.loading) {
    return <LoadingSpinner/>;
  }

  if (state.error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  if (!state.loaded) {
    return null;
  }

  return (
    <form className="form-horizontal">
      <FormContainer
        submitting={props.submitting}
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
        {state.data.zones.length > 0 && (
          <SelectField
            label={translate('Availability zone')}
            name="attributes.availability_zone"
            options={state.data.zones}
            labelKey="name"
            valueKey="url"
            simpleValue={true}
            required={ENV.plugins.WALDUR_OPENSTACK_TENANT.REQUIRE_AVAILABILITY_ZONE}
            validate={ENV.plugins.WALDUR_OPENSTACK_TENANT.REQUIRE_AVAILABILITY_ZONE ? required : undefined}
          />
        )}
        {state.data.volumeTypes.length > 0 && (
          <SelectField
            label={translate('Volume type')}
            name="attributes.type"
            options={state.data.volumeTypes}
            simpleValue={true}
            required={true}
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
};
