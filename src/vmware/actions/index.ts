import { ActionRegistry } from '@waldur/resource/actions/registry';

import { ConsoleAction } from './ConsoleAction';
import { DestroyVirtualMachineAction } from './DestroyVirtualMachineAction';
import { EditAction } from './EditAction';
import { ExtendDiskAction } from './ExtendDiskAction';
import { PullDiskAction } from './PullDiskAction';
import { PullPortAction } from './PullPortAction';
import { PullVirtualMachineAction } from './PullVirtualMachineAction';
import { RebootAction } from './RebootAction';
import { ResetAction } from './ResetAction';
import { ShutdownAction } from './ShutdownAction';
import { StartAction } from './StartAction';
import { StopAction } from './StopAction';
import { SuspendAction } from './SuspendAction';

ActionRegistry.register('VMware.VirtualMachine', [
  PullVirtualMachineAction,
  ConsoleAction,
  EditAction,
  StartAction,
  StopAction,
  ResetAction,
  ShutdownAction,
  RebootAction,
  SuspendAction,
  DestroyVirtualMachineAction,
]);

ActionRegistry.register('VMware.Disk', [PullDiskAction, ExtendDiskAction]);

ActionRegistry.register('VMware.Port', [PullPortAction]);
