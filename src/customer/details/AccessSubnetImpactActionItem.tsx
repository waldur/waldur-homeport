import { TargetIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AccessSubnetImpactDialog = lazyComponent(() =>
  import('./AccessSubnetImpactDialog').then((module) => ({
    default: module.AccessSubnetImpactDialog,
  })),
);

/** Row entry: the resources this one address reaches. */
export const AccessSubnetImpactActionItem = ({ row, customer_uuid }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Show resource impact')}
      iconNode={<TargetIcon weight="bold" />}
      action={() =>
        openDialog(AccessSubnetImpactDialog, {
          resolve: {
            customerUuid: customer_uuid,
            accessSubnetUuid: row.uuid,
            inet: row.inet,
          },
          size: 'xl',
        })
      }
    />
  );
};
