import { useMemo, useState } from 'react';
import { Permission } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { canDeletePermission, revokePermission } from './utils';

interface OwnProps {
  rows: Permission[];
  refetch(): void;
}

export const UserAffiliationsBulkRemoveButton = ({
  rows,
  refetch,
}: OwnProps) => {
  const { confirm } = useModal();
  const currentUser = useUser();

  const allowedItemsToRemove = useMemo(
    () => rows.filter((perm) => canDeletePermission(currentUser, perm)),
    [rows, currentUser],
  );
  const [isRemoving, setIsRemoving] = useState(false);

  const { showErrorResponse, showSuccess } = useNotify();

  const callback = async () => {
    try {
      const itemsList = allowedItemsToRemove.map((perm) => (
        <li key={perm.scope_uuid}>
          {perm.role_name} ({renderFieldOrDash(perm.scope_name)})
        </li>
      ));

      const confirmationText = translate(
        'You are about to revoke these permissions. Once revoked, access and all associated permissions will be immediately lost.',
      );

      const formattedMessage = (
        <div>
          <p>{confirmationText}</p>
          <ul>{itemsList}</ul>
        </div>
      );

      await confirm(
        translate('Revoke selected permissions'),
        formattedMessage,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsRemoving(true);
      let successCount = 0;
      let failureCount = 0;

      for (const perm of allowedItemsToRemove) {
        try {
          await revokePermission(perm);
          successCount++;
        } catch (e) {
          failureCount++;
          showErrorResponse(
            e,
            translate('Unable to revoke permission {userName}.', {
              userName: `${perm.role_name} (${renderFieldOrDash(perm.scope_name)})`,
            }),
          );
        }
      }

      if (successCount > 0 && failureCount === 0) {
        showSuccess(
          translate(
            '{successCount} permissions have been successfully revoked.',
            {
              successCount,
            },
          ),
        );
      }

      await refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to revoke permissions.'));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <RemovalActionButton
      title={translate('Revoke')}
      action={callback}
      tooltip={
        allowedItemsToRemove.length
          ? translate('Revoke all selected permissions. ({n} allowed)', {
              n: allowedItemsToRemove.length,
            })
          : translate(
              "You don't have enough privileges to perform this operation.",
            )
      }
      disabled={isRemoving || !allowedItemsToRemove.length}
    />
  );
};
