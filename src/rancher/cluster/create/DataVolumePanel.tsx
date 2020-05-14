import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import { Option } from 'react-select';
import { FormSection, FormName } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { RemoveButton } from '@waldur/marketplace/offerings/RemoveButton';

import { VolumeMountPointGroup } from './VolumeMountPointGroup';
import { VolumeSizeGroup } from './VolumeSizeGroup';
import { VolumeTypeGroup } from './VolumeTypeGroup';

interface OwnProps {
  volumeIndex: number;
  volumePath: string;
  nodeIndex: number;
  onRemove(index: number): void;
  volumeTypes: Option[];
  mountPoints: Option[];
}

export const DataVolumePanel = (props: OwnProps) => (
  <Panel>
    <Panel.Heading>
      <RemoveButton onClick={() => props.onRemove(props.volumeIndex)} />
      <h4>
        {translate('Data volume #{index}', { index: props.volumeIndex + 1 })}
      </h4>
    </Panel.Heading>
    <Panel.Body>
      <FormSection name={props.volumePath}>
        {isFeatureVisible('Rancher.VolumeMountPoint') && (
          <FormName>
            {({ form }) => (
              <VolumeMountPointGroup
                form={form}
                nodeIndex={props.nodeIndex}
                volumeIndex={props.volumeIndex}
                mountPoints={props.mountPoints}
              />
            )}
          </FormName>
        )}
        <VolumeSizeGroup
          nodeIndex={props.nodeIndex}
          volumeIndex={props.volumeIndex}
        />
        <VolumeTypeGroup volumeTypes={props.volumeTypes} />
      </FormSection>
    </Panel.Body>
  </Panel>
);
