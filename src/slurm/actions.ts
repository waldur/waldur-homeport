import { translate } from '@waldur/i18n';
import terminateAction from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import {
  createPullAction,
  createEditAction,
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { updateAllocation } from './api';
import { AllocationDetailsDialog } from './details/AllocationDetailsDialog';

const createDetailsAction = (): ResourceAction => ({
  name: 'details',
  title: translate('Details'),
  component: AllocationDetailsDialog,
  useResolve: true,
  type: 'form',
  dialogSize: 'lg',
});

const createAllocationEditAction = ({ resource }) =>
  createEditAction({
    resource,
    verboseName: translate('SLURM allocation'),
    updateResource: updateAllocation,
    fields: [createNameField(), createDescriptionField()],
  });

ActionConfigurationRegistry.register('SLURM.Allocation', [
  createDetailsAction,
  createPullAction,
  createAllocationEditAction,
  terminateAction,
]);
