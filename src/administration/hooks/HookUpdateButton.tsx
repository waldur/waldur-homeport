import { FunctionComponent } from 'react';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';

const HookDetailsDialog = lazyComponent(() =>
  import('@waldur/user/hooks/HookDetailsDialog').then((module) => ({
    default: module.HookDetailsDialog,
  })),
);

interface HookUpdateButtonProps {
  row: any;
  refetch?: () => void;
}

export const HookUpdateButton: FunctionComponent<HookUpdateButtonProps> = ({
  row,
  refetch,
}) => (
  <EditModalButton
    dialog={HookDetailsDialog}
    row={row}
    buildResolve={(r) => ({ hook: r, refetch })}
    size="lg"
    title={translate('Update')}
  />
);
