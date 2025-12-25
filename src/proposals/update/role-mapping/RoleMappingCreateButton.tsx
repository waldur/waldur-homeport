import { FunctionComponent } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const RoleMappingFormDialog = lazyComponent(() =>
  import('./RoleMappingFormDialog').then((module) => ({
    default: module.RoleMappingFormDialog,
  })),
);

export const RoleMappingCreateButton: FunctionComponent<{ refetch; call }> = ({
  refetch,
  call,
}) => (
  <CreateModalButton
    dialog={RoleMappingFormDialog}
    resolve={{ call, refetch }}
    size="sm"
  />
);
