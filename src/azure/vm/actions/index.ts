import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';

import { DestroyAction } from './DestroyAction';
import { PullAction } from './PullAction';
import { RestartAction } from './RestartAction';
import { StartAction } from './StartAction';
import { StopAction } from './StopAction';

export default [
  PullAction,
  StartAction,
  StopAction,
  RestartAction,
  MoveResourceAction,
  DestroyAction,
];
