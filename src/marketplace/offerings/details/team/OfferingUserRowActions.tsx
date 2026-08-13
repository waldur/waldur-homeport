import { ClockIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceProviderOfferingsDeleteUser,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

const UpdateOfferingUserExpirationDialog = lazyComponent(() =>
  import('./UpdateOfferingUserExpirationDialog').then((module) => ({
    default: module.UpdateOfferingUserExpirationDialog,
  })),
);

const UpdateExpirationAction: FC<{
  row;
  offering: Offering;
  refetch(): void;
}> = ({ row, offering, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Update expiration')}
      iconNode={<ClockIcon weight="bold" />}
      action={() =>
        openDialog(UpdateOfferingUserExpirationDialog, {
          resolve: { row, offeringUuid: offering.uuid, refetch },
          size: 'sm',
        })
      }
    />
  );
};

const RevokeAction: FC<{ row; offering: Offering; refetch(): void }> = ({
  row,
  offering,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsDeleteUser({
        path: { uuid: offering.uuid },
        body: { user: row.user_uuid, role: row.role_name } as any,
      }),
    successMessage: translate('Role has been revoked.'),
    errorMessage: translate('Unable to revoke role.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to revoke the role of {name} in this offering?',
        { name: <b>{row.user_full_name || row.user_username}</b> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Revoke')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};

/**
 * Row actions for the offering Team tab. Both are gated on the offering scope
 * as well as the parent customer: an OFFERING.MANAGER holds the permission on
 * the offering itself and may have no role on the customer at all, which the
 * backend accepts (`UserRoleCreateSerializer.validate`).
 */
export const OfferingUserRowActions: FC<{
  row;
  offering: Offering;
  refetch(): void;
}> = ({ row, offering, refetch }) => {
  const user = useUser();
  const scope = {
    offeringId: offering.uuid,
    customerId: offering.customer_uuid ?? undefined,
  };
  const canUpdate = hasPermission(user, {
    ...scope,
    permission: PermissionEnum.UPDATE_OFFERING_PERMISSION,
  });
  const canDelete = hasPermission(user, {
    ...scope,
    permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
  });

  if (!canUpdate && !canDelete) {
    return null;
  }

  return (
    <ActionsDropdown row={row} refetch={refetch}>
      {canUpdate && (
        <UpdateExpirationAction
          row={row}
          offering={offering}
          refetch={refetch}
        />
      )}
      {canDelete && (
        <RevokeAction row={row} offering={offering} refetch={refetch} />
      )}
    </ActionsDropdown>
  );
};
