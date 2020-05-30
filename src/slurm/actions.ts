import { translate } from '@waldur/i18n';
import terminateAction from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import {
  createPullAction,
  createDefaultEditAction,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const createDetailsAction = (): ResourceAction => ({
  name: 'details',
  title: translate('Details'),
  component: 'slurmAllocationDetailsDialog',
  useResolve: true,
  type: 'form',
  dialogSize: 'lg',
});

const createEditAction = () => ({
  ...createDefaultEditAction(),
  successMessage: translate('Allocation has been updated.'),
});

ActionConfigurationRegistry.register('SLURM.Allocation', [
  createDetailsAction,
  createPullAction,
  createEditAction,
  terminateAction,
]);
