import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';

import { DataVolumeAddButton } from './DataVolumeAddButton';
import { DataVolumePanel } from './DataVolumePanel';

export const DataVolumesList = props => (
  <div className="form-group">
    <Col smOffset={props.smOffset} sm={props.sm}>
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
      <DataVolumeAddButton
        onClick={() =>
          props.fields.push({
            size: 1,
            volume_type: props.defaultVolumeType,
          })
        }
      />
    </Col>
  </div>
);

DataVolumesList.defaultProps = {
  smOffset: 4,
  sm: 8,
};
