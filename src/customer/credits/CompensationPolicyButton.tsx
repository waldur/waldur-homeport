import { ReceiptIcon } from '@phosphor-icons/react';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const CompensationPolicyDialog = lazyComponent(() =>
  import('./CompensationPolicyDialog').then((module) => ({
    default: module.CompensationPolicyDialog,
  })),
);

/** Staff only, as the setting is: paying earlier invoices from a credit
 * changes what the organization was billed. */
export const CompensationPolicyButton = ({ row, refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();
  if (!user?.is_staff) {
    return null;
  }
  return (
    <Menu.Item
      icon={<ReceiptIcon weight="bold" />}
      onSelect={() =>
        openDialog(CompensationPolicyDialog, {
          size: 'lg',
          resolve: { credit: row, refetch },
        })
      }
    >
      <span className="inline-flex items-center gap-1">
        {translate('Compensation policy')}
        <StaffOnlyIndicator />
      </span>
    </Menu.Item>
  );
};
