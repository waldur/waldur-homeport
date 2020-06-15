import { consoleAction } from './ConsoleAction';
import { consoleLogAction } from './ConsoleLogAction';
import destroyAction from './DestroyAction';
import linkAction from './LinkAction';
import { pullAction } from './PullAction';
import unlinkAction from './UnlinkAction';

export default [
  pullAction,
  linkAction,
  unlinkAction,
  destroyAction,
  consoleAction,
  consoleLogAction,
];
