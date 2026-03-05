import { TrashIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Permission } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { renderFieldOrDash } from '@waldur/table/utils';
import { useUser } from '@waldur/workspace/hooks';

import { canDeletePermission, revokePermission } from './utils';

interface OwnProps {
  rows: Permission[];
  refetch(): void;
}

export const UserAffiliationsBulkRemoveButton = ({
  rows,
  refetch,
}: OwnProps) => {
  const currentUser = useUser();
  const allowedItemsToRemove = useMemo(
    () => rows.filter((perm) => canDeletePermission(currentUser, perm)),
    [rows, currentUser],
  );

  const [isRemoving, setIsRemoving] = useState(false);
  const dispatch = useDispatch();

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

      await waitForConfirmation(
        dispatch,
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
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to revoke permission {userName}.', {
                userName: `${perm.role_name} (${renderFieldOrDash(perm.scope_name)})`,
              }),
            ),
          );
        }
      }

      if (successCount > 0 && failureCount === 0) {
        dispatch(
          showSuccess(
            translate(
              '{successCount} permissions have been successfully revoked.',
              {
                successCount,
              },
            ),
          ),
        );
      }

      await refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to revoke permissions.')),
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <ActionButton
      title={translate('Revoke')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
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
