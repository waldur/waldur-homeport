import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

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
  const dispatch = useDispatch();

  const user = useUser();
  const canShow = useMemo(() => {
    // Check if the offering of all resources is the same & check permission
    const offeringUuid = rows[0].offering_uuid;
    return rows.every(
      (resource) =>
        resource.offering_uuid === offeringUuid &&
        hasPermission(user, {
          permission: PermissionEnum.UPDATE_RESOURCE_OPTIONS,
          projectId: resource.project_uuid,
          customerId: resource.customer_uuid,
        }),
    );
  }, [rows, user]);

  const callback = () =>
    dispatch(
      openModalDialog(MultiEditOptionsDialog, {
        resolve: {
          rows,
          refetch,
        },
      }),
    );

  return canShow ? (
    asButton ? (
      <Button variant="tertiary" onClick={callback}>
        <span className="svg-icon svg-icon-2">
          <PencilSimpleIcon weight="bold" />
        </span>
        {translate('Edit all')}
      </Button>
    ) : (
      <EditAction
        title={translate('Edit resource options')}
        action={callback}
      />
    )
  ) : null;
};
