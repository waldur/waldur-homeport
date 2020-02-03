import { createPullAction } from '@waldur/resource/actions/base';

import { kubeconfigAction } from './KubeconfigFileAction';
import terminateAction from './TerminateAction';

export default [
  kubeconfigAction,
  createPullAction,
  terminateAction,
];
