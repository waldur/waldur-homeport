import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const RoleMappingFormDialog = lazyComponent(() =>
  import('./RoleMappingFormDialog').then((module) => ({
    default: module.RoleMappingFormDialog,
  })),
);

export const RoleMappingCreateButton: FunctionComponent<{
  refetch;
  call;
  disabled?: boolean;
  tooltip?: string;
}> = ({ refetch, call, disabled, tooltip }) => (
  <CreateModalButton
    dialog={RoleMappingFormDialog}
    resolve={{ call, refetch }}
    size="sm"
    disabled={disabled}
    tooltip={tooltip}
  />
);
