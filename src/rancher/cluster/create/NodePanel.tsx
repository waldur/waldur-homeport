import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { FormSection } from 'redux-form';

import { translate } from '@waldur/i18n';

import { NodeFlavorGroup } from './NodeFlavorGroup';
import { NodeRemoveButton } from './NodeRemoveButton';
import { NodeRoleGroup } from './NodeRoleGroup';
import { NodeStorageGroup } from './NodeStorageGroup';

export const NodePanel: FunctionComponent<any> = (props) => (
  <Card>
    <Card.Header>
      <NodeRemoveButton onClick={() => props.onRemove(props.index)} />
      <h4>
        {translate('Kubernetes node #{index}', { index: props.index + 1 })}
      </h4>
    </Card.Header>
    <Card.Body>
      <FormSection name={props.node}>
        <NodeRoleGroup />
        <NodeFlavorGroup options={props.flavors} nodeIndex={props.index} />
        <NodeStorageGroup
          nodeIndex={props.index}
          volumeTypes={props.volumeTypes}
          mountPoints={props.mountPoints}
          defaultVolumeType={props.defaultVolumeType}
        />
      </FormSection>
    </Card.Body>
  </Card>
);
