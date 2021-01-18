import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';

import { destroySnapshotSchedule } from '../../api';

const validators = [validateState('OK', 'Erred')];

export const DestroySnapshotScheduleAction = ({ resource }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroySnapshotSchedule}
  />
);
