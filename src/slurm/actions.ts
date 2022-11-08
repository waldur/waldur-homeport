import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ActionRegistry } from '@waldur/resource/actions/registry';

import { EditAction } from './EditAction';
import { PullAllocationAction } from './PullAllocationAction';
import { RequestLimitsChangeAction } from './RequestLimitsChangeAction';
import { SetLimitsAction } from './SetLimitsAction';

ActionRegistry.register('SLURM.Allocation', [
  PullAllocationAction,
  EditAction,
  SetLimitsAction,
  TerminateAction,
  RequestLimitsChangeAction,
]);
