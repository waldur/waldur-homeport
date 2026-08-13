import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasAllPermissions } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const MultiEditOptionsDialog = lazyComponent(() =>
  import('./MultiEditOptionsDialog').then((module) => ({
    default: module.MultiEditOptionsDialog,
  })),
);

export const MultiEditOptionsAction = ({
  rows,
  refetch,
  asButton,
}: {
  rows: Resource[];
  refetch;
  asButton?: boolean;
}) => {
  const { openDialog } = useModal();

  const user = useUser();
  const canShow = useMemo(() => {
    // Check if the offering of all resources is the same & check permission
    const offeringUuid = rows[0].offering_uuid;
    return rows.every((resource) => {
      // Offerings that apply option changes through a marketplace order need
      // order creation rights as well.
      const createsOrder = Boolean(
        (resource.offering_plugin_options as any)
          ?.create_orders_on_resource_option_change,
      );
      return (
        resource.offering_uuid === offeringUuid &&
        hasAllPermissions(
          user,
          createsOrder
            ? [
                PermissionEnum.UPDATE_RESOURCE_OPTIONS,
                PermissionEnum.CREATE_ORDER,
              ]
            : [PermissionEnum.UPDATE_RESOURCE_OPTIONS],
          {
            projectId: resource.project_uuid,
            customerId: resource.customer_uuid,
          },
        )
      );
    });
  }, [rows, user]);

  const callback = () =>
    openDialog(MultiEditOptionsDialog, {
      resolve: {
        rows,
        refetch,
      },
    });

  return canShow ? (
    asButton ? (
      <ActionButton
        variant="tertiary"
        action={callback}
        iconNode={<PencilSimpleIcon weight="bold" />}
        title={translate('Edit all')}
      />
    ) : (
      <EditAction
        title={translate('Edit resource options')}
        action={callback}
      />
    )
  ) : null;
};
