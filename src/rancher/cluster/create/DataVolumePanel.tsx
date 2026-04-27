import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { FormSection } from 'redux-form';

import { isFeatureVisible } from '@/features/connect';
import { RancherFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { RemoveButton } from '@/marketplace/offerings/RemoveButton';

import { VolumeMountPointGroup } from './VolumeMountPointGroup';
import { VolumeSizeGroup } from './VolumeSizeGroup';
import { VolumeTypeGroup } from './VolumeTypeGroup';

interface OwnProps {
  volumeIndex: number;
  volumePath: string;
  nodeIndex: number;
  onRemove(index: number): void;
  volumeTypes: any[];
}

export const DataVolumePanel: FunctionComponent<OwnProps> = (props) => (
  <Card className="card-bordered">
    <Card.Header>
      <RemoveButton onClick={() => props.onRemove(props.volumeIndex)} />
      <h4>
        {translate('Data volume #{index}', { index: props.volumeIndex + 1 })}
      </h4>
    </Card.Header>
    <Card.Body>
      <FormSection name={props.volumePath}>
        {isFeatureVisible(RancherFeatures.volume_mount_point) && (
          <VolumeMountPointGroup nodeIndex={props.nodeIndex} />
        )}
        <VolumeSizeGroup />
        <VolumeTypeGroup volumeTypes={props.volumeTypes} />
      </FormSection>
    </Card.Body>
  </Card>
);
