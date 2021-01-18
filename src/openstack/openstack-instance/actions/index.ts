import { ChangeFlavorAction } from './ChangeFlavorAction';
import { ConsoleAction } from './ConsoleAction';
import { ConsoleLogAction } from './ConsoleLogAction';
import { DestroyAction } from './DestroyAction';
import { EditAction } from './EditAction';
import { ForceDestroyAction } from './ForceDestroyAction';
import { PullInstanceAction } from './PullInstanceAction';
import { RestartAction } from './RestartAction';
import { StartAction } from './StartAction';
import { StopAction } from './StopAction';
import { UpdateFloatingIpsAction } from './update-floating-ips/UpdateFloatingIpsAction';
import { UpdateSecurityGroupsAction } from './update-security-groups/UpdateSecurityGroupsAction';

export default [
  EditAction,
  PullInstanceAction,
  StartAction,
  StopAction,
  RestartAction,
  ConsoleLogAction,
  ConsoleAction,
  ChangeFlavorAction,
  UpdateSecurityGroupsAction,
  UpdateFloatingIpsAction,
  DestroyAction,
  ForceDestroyAction,
];
