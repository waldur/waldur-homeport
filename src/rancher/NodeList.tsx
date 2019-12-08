import * as React from 'react';

import { DEFAULT_NODE_CONFIGURATION } from './constants';
import { NodeAddButton } from './NodeAddButton';
import { NodePanel } from './NodePanel';

export const NodeList = props => {
  const onAdd = () => {
    props.fields.push(DEFAULT_NODE_CONFIGURATION);
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
        />
      ))}
      <NodeAddButton onClick={onAdd}/>
    </>
  );
};
