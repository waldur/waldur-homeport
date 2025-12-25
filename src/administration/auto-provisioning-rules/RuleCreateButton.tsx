import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const RuleFormDialog = lazyComponent(() =>
  import('./RuleFormDialog').then((module) => ({
    default: module.RuleFormDialog,
  })),
);

export const RuleCreateButton = ({ refetch }) => (
  <CreateModalButton dialog={RuleFormDialog} resolve={{ refetch }} />
);
