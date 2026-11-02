import { FunctionComponent } from 'react';

import { getNodeRoleLabels } from './nodeRoles';

export const NodeRoleField: FunctionComponent<{ node }> = ({ node }) =>
  getNodeRoleLabels()[node.role === 'agent' ? 'agent' : 'server'];
