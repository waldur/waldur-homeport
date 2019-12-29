import terminateAction from '@waldur/marketplace/resources/terminate/TerminateAction';
import { createPullAction } from '@waldur/resource/actions/base';

import { kubeconfigAction } from './KubeconfigFileAction';

export default [
  kubeconfigAction,
  createPullAction,
  terminateAction,
];
