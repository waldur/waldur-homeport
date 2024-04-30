import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';

import { DataVolumeAddButton } from './DataVolumeAddButton';
import { DataVolumePanel } from './DataVolumePanel';

export const DataVolumesList: FunctionComponent<any> = ({
  sm = { span: 8, offset: 4 },
  ...props
}) => (
  <Form.Group>
    <Col sm={sm}>
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
  </Form.Group>
);
