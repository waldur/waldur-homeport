import * as React from 'react';
import { Field } from 'redux-form';

import { OpenstackInstanceDataVolume } from '@waldur/openstack/openstack-instance/OpenstackInstanceDataVolume';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const DataVolumeSizeGroup = () => (
  <CreateResourceFormGroup>
    <Field
      name="attributes.data_volume_size"
      component={fieldProps =>
        <OpenstackInstanceDataVolume
          field={{
            input: fieldProps.input,
            min: 1,
            max: 1 * 4096,
          }}
          units="GB"
        />
      }
      format={v => v ? v / 1024 : ''}
      normalize={v => Number(v) * 1024}
    />
  </CreateResourceFormGroup>
);
