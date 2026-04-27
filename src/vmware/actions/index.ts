import { ActionConfiguration } from '@/resource/actions/types';

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

export const VMwareVirtualMachineActions: ActionConfiguration = {
  type: 'VMware.VirtualMachine',
  actions: [
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
  ],
};

export const VMwareDiskActions: ActionConfiguration = {
  type: 'VMware.Disk',
  actions: [PullDiskAction, ExtendDiskAction],
};

export const VMwarePortActions: ActionConfiguration = {
  type: 'VMware.Port',
  actions: [PullPortAction],
};
