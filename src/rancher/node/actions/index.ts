import { ConsoleAction } from './ConsoleAction';
import { ConsoleLogAction } from './ConsoleLogAction';
import { DestroyAction } from './DestroyAction';
import { LinkAction } from './LinkAction';
import { PullNodeAction } from './PullNodeAction';
import { UnlinkAction } from './UnlinkAction';

export default [
  PullNodeAction,
  LinkAction,
  UnlinkAction,
  DestroyAction,
  ConsoleAction,
  ConsoleLogAction,
];
