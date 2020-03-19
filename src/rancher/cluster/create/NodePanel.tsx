import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import { FormSection } from 'redux-form';

import { translate } from '@waldur/i18n';

import { NodeFlavorGroup } from './NodeFlavorGroup';
import { NodeRemoveButton } from './NodeRemoveButton';
import { NodeRoleGroup } from './NodeRoleGroup';
import { NodeStorageGroup } from './NodeStorageGroup';

export const NodePanel = props => (
  <Panel>
    <Panel.Heading>
      <NodeRemoveButton onClick={() => props.onRemove(props.index)} />
      <h4>
        {translate('Kubernetes node #{index}', { index: props.index + 1 })}
      </h4>
    </Panel.Heading>
    <Panel.Body>
      <FormSection name={props.node}>
        <NodeRoleGroup />
        <NodeFlavorGroup options={props.flavors} />
        <NodeStorageGroup
          nodeIndex={props.index}
          volumeTypes={props.volumeTypes}
          mountPoints={props.mountPoints}
          defaultVolumeType={props.defaultVolumeType}
        />
      </FormSection>
    </Panel.Body>
  </Panel>
);
