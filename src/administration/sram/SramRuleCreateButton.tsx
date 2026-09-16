import { FC } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const SramRuleFormDialog = lazyComponent(() =>
  import('./SramRuleFormDialog').then((module) => ({
    default: module.SramRuleFormDialog,
  })),
);

export const SramRuleCreateButton: FC<{ refetch }> = ({ refetch }) => (
  <CreateModalButton dialog={SramRuleFormDialog} resolve={{ refetch }} />
);
