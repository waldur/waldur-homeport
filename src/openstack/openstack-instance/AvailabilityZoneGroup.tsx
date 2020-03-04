import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/services';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const AvailabilityZoneGroup = props =>
  props.availabilityZones.length > 0 ? (
    <CreateResourceFormGroup
      label={translate('Availability zone')}
      required={ENV.plugins.WALDUR_OPENSTACK_TENANT.REQUIRE_AVAILABILITY_ZONE}
    >
      <Field
        name="attributes.availability_zone"
        validate={
          ENV.plugins.WALDUR_OPENSTACK_TENANT.REQUIRE_AVAILABILITY_ZONE
            ? required
            : undefined
        }
        component={fieldProps => (
          <Select
            value={fieldProps.input.value}
            onChange={fieldProps.input.onChange}
            options={props.availabilityZones}
            labelKey="name"
            valueKey="url"
            simpleValue={true}
          />
        )}
      />
    </CreateResourceFormGroup>
  ) : null;
