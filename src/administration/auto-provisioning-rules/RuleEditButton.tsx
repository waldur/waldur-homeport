import { FC } from 'react';
import { Rule } from 'waldur-js-client';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const RuleFormDialog = lazyComponent(() =>
  import('./RuleFormDialog').then((module) => ({
    default: module.RuleFormDialog,
  })),
);

interface RuleEditButtonProps {
  row: Rule;
  refetch;
}

export const RuleEditButton: FC<RuleEditButtonProps> = ({ row, refetch }) => (
  <EditModalButton
    dialog={RuleFormDialog}
    row={row}
    buildResolve={(r) => ({ refetch, rule: r })}
  />
);
