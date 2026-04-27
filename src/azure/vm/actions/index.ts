import { AZURE_VM_TYPE } from '@/azure/constants';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { ActionConfiguration } from '@/resource/actions/types';

import { DestroyAction } from './DestroyAction';
import { PullAction } from './PullAction';
import { RestartAction } from './RestartAction';
import { StartAction } from './StartAction';
import { StopAction } from './StopAction';

export const AzureVirtualMachineActions: ActionConfiguration = {
  type: AZURE_VM_TYPE,
  actions: [
    PullAction,
    StartAction,
    StopAction,
    RestartAction,
    MoveResourceAction,
    DestroyAction,
  ],
};
