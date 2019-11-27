import * as React from 'react';

import { DEFAULT_NODE_CONFIGURATION } from './constants';
import { NodeAddButton } from './NodeAddButton';
import { NodePanel } from './NodePanel';

export const NodeList = props => (
  <>
    {props.fields.map((node, index) => (
      <NodePanel
        node={node}
        index={index}
        key={index}
        onRemove={props.fields.remove}
        subnetChoices={props.subnetChoices}
      />
    ))}
    <NodeAddButton onClick={() => props.fields.push(DEFAULT_NODE_CONFIGURATION)}/>
  </>
);
