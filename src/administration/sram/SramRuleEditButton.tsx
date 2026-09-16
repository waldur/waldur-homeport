import { FC } from 'react';
import { SramProjectRule } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const SramRuleFormDialog = lazyComponent(() =>
  import('./SramRuleFormDialog').then((module) => ({
    default: module.SramRuleFormDialog,
  })),
);

interface SramRuleEditButtonProps {
  row: SramProjectRule;
  refetch;
}

export const SramRuleEditButton: FC<SramRuleEditButtonProps> = ({
  row,
  refetch,
}) => (
  <EditModalButton
    dialog={SramRuleFormDialog}
    row={row}
    buildResolve={(rule) => ({ refetch, rule })}
  />
);
