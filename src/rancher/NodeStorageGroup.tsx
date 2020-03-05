import * as React from 'react';
import { FieldArray } from 'redux-form';

import { DataVolumesList } from './DataVolumesList';
import { SystemVolumeSizeGroup } from './SystemVolumeSizeGroup';
import { SystemVolumeTypeGroup } from './SystemVolumeTypeGroup';

export const NodeStorageGroup = props => (
  <>
    <SystemVolumeSizeGroup
      labelClassName={props.labelClassName}
      valueClassName={props.valueClassName}
    />
    <SystemVolumeTypeGroup
      volumeTypes={props.volumeTypes}
      labelClassName={props.labelClassName}
      valueClassName={props.valueClassName}
    />
    {props.mountPoints.length > 0 && (
      <FieldArray
        name="data_volumes"
        component={DataVolumesList}
        nodeIndex={props.nodeIndex}
        mountPoints={props.mountPoints}
        volumeTypes={props.volumeTypes}
        defaultVolumeType={props.defaultVolumeType}
        smOffset={props.smOffset}
        sm={props.sm}
      />
    )}
  </>
);
