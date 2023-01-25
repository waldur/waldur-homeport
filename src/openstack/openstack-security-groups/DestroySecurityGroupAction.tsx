import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { destroySecurityGroup } from '../api';

export const DestroySecurityGroupAction: ActionItemType = ({
  resource,
  refetch,
}) =>
  resource.name !== 'default' ? (
    <DestroyActionItem
      resource={resource}
      apiMethod={destroySecurityGroup}
      refetch={refetch}
    />
  ) : null;
