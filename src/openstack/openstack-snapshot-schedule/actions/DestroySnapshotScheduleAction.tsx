import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroySnapshotSchedule } from '../../api';

const validators = [validateState('OK', 'Erred')];

export const DestroySnapshotScheduleAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroySnapshotSchedule}
    refetch={refetch}
  />
);
