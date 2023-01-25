import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroySnapshot } from '../api';

const validators = [validateState('OK', 'Erred')];

export const DestroySnapshotAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    refetch={refetch}
    apiMethod={destroySnapshot}
  />
);
