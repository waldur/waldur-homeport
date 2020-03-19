import { createPullAction } from '@waldur/resource/actions/base';

import { createNodeAction } from './CreateNodeAction';
import { kubeconfigAction } from './KubeconfigFileAction';
import terminateAction from './TerminateAction';

export default [
  createNodeAction,
  kubeconfigAction,
  createPullAction,
  terminateAction,
];
