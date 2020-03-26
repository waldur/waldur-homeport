import { createNodeAction } from './CreateNodeAction';
import { kubeconfigAction } from './KubeconfigFileAction';
import { pullAction } from './PullAction';
import terminateAction from './TerminateAction';

export default [
  createNodeAction,
  kubeconfigAction,
  pullAction,
  terminateAction,
];
