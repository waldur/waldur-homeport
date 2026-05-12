import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';
import { FieldArray } from 'react-final-form-arrays';

import { ENV } from '@/core/config';

import { DataVolumeAddButton } from './DataVolumeAddButton';
import { DataVolumePanel } from './DataVolumePanel';
import { SystemVolumeSizeGroup } from './SystemVolumeSizeGroup';
import { SystemVolumeTypeGroup } from './SystemVolumeTypeGroup';

export const NodeStorageGroup: FunctionComponent<any> = (props) => (
  <>
    <SystemVolumeSizeGroup />
    <SystemVolumeTypeGroup volumeTypes={props.volumeTypes} />
    {!ENV.plugins.WALDUR_RANCHER.DISABLE_DATA_VOLUME_CREATION && (
      <FieldArray
        name="data_volumes"
        component={({ fields }) => (
          <Form.Group>
            <Col sm={{ span: 9, offset: 3 }}>
              {fields.map((volume, index) => (
                <DataVolumePanel
                  key={index}
                  nodeIndex={props.nodeIndex}
                  volumeIndex={index}
                  volumePath={volume}
                  onRemove={fields.remove}
                  volumeTypes={props.volumeTypes}
                />
              ))}
              <DataVolumeAddButton
                onClick={() =>
                  fields.push({
                    size: 1,
                    volume_type: props.defaultVolumeType,
                  })
                }
              />
            </Col>
          </Form.Group>
        )}
      />
    )}
  </>
);
