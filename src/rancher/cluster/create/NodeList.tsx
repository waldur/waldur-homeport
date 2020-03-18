import * as React from 'react';

import { ENV } from '@waldur/core/services';

import { DEFAULT_NODE_CONFIGURATION } from './constants';
import { NodeAddButton } from './NodeAddButton';
import { NodePanel } from './NodePanel';

export const NodeList = props => {
  const onAdd = () => {
    props.fields.push({
      ...DEFAULT_NODE_CONFIGURATION,
      system_volume_size:
        ENV.plugins.WALDUR_RANCHER.SYSTEM_VOLUME_MIN_SIZE || 1,
      system_volume_type: props.defaultVolumeType,
    });
    props.onChange(props.fields.length + 1);
  };

  const onRemove = index => {
    props.fields.remove(index);
    props.onChange(props.fields.length - 1);
  };

  return (
    <>
      {props.fields.map((node, index) => (
        <NodePanel
          node={node}
          index={index}
          key={index}
          onRemove={onRemove}
          flavors={props.flavors}
          volumeTypes={props.volumeTypes}
          mountPoints={props.mountPoints}
          defaultVolumeType={props.defaultVolumeType}
        />
      ))}
      <NodeAddButton onClick={onAdd} />
    </>
  );
};
