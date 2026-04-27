import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const ComponentPolicyFormDialog = lazyComponent(() =>
  import('./ComponentPolicyFormDialog').then((module) => ({
    default: module.ComponentPolicyFormDialog,
  })),
);

export const ComponentPolicyCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={ComponentPolicyFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
