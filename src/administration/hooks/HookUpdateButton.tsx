import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

const HookDetailsDialog = lazyComponent(() =>
  import('@/user/hooks/HookDetailsDialog').then((module) => ({
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
