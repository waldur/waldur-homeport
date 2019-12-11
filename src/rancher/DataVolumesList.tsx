import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';

import { getDefaultVolumeTypeUrl } from '@waldur/openstack/openstack-instance/utils';

import { DataVolumeAddButton } from './DataVolumeAddButton';
import { DataVolumePanel } from './DataVolumePanel';

export const DataVolumesList = props => (
  <div className="form-group">
    <Col smOffset={4} sm={8}>
      {props.fields.map((volume, index) => (
        <DataVolumePanel
          key={index}
          nodeIndex={props.nodeIndex}
          volumeIndex={index}
          volumePath={volume}
          onRemove={props.fields.remove}
          volumeTypes={props.volumeTypes}
          mountPoints={props.mountPoints}
        />
      ))}
      <DataVolumeAddButton onClick={() => props.fields.push({
        size: 1,
        volume_type: getDefaultVolumeTypeUrl(props.volumeTypes),
      })}/>
    </Col>
  </div>
);
