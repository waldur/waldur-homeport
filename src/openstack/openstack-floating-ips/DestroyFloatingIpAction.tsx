import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroyFloatingIP } from '../api';

const validators = [validateState('OK', 'Erred')];

export const DestroyFloatingIpAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={destroyFloatingIP}
    refetch={refetch}
  />
);
