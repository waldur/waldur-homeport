import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ActionRegistry } from '@waldur/resource/actions/registry';

import { DetailsAction } from './DetailsAction';
import { EditAction } from './EditAction';
import { PullAllocationAction } from './PullAllocationAction';

ActionRegistry.register('SLURM.Allocation', [
  DetailsAction,
  PullAllocationAction,
  EditAction,
  TerminateAction,
]);
