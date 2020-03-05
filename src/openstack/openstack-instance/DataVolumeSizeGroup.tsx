import * as React from 'react';
import { Field } from 'redux-form';

import { OpenstackInstanceDataVolume } from '@waldur/openstack/openstack-instance/OpenstackInstanceDataVolume';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const DataVolumeSizeGroup = props => (
  <CreateResourceFormGroup>
    <Field
      name="attributes.data_volume_size"
      component={OpenstackInstanceDataVolume as any}
      min={1}
      max={1 * 4096}
      units="GB"
      isActive={props.isActive}
      setActive={props.setActive}
      format={v => (v ? v / 1024 : '')}
      normalize={v => Number(v) * 1024}
    />
  </CreateResourceFormGroup>
);
