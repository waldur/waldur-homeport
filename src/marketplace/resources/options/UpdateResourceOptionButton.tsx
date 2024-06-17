import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getUser } from '@waldur/workspace/selectors';

const UpdateResourceOptionDialog = lazyComponent(
  () => import('./UpdateResourceOptionDialog'),
  'UpdateResourceOptionDialog',
);

export const UpdateResourceOptionButton: FunctionComponent<{
  resource;
  option;
  refetch?;
}> = (props) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(UpdateResourceOptionDialog, {
        resolve: props,
      }),
    );
  };
  return (
    <Button
      onClick={callback}
      size="sm"
      disabled={
        !hasPermission(user, {
          permission: PermissionEnum.UPDATE_RESOURCE_OPTIONS,
          projectId: props.resource.project_uuid,
          customerId: props.resource.customer_uuid,
        })
      }
    >
      <PencilSimple /> {translate('Edit')}
    </Button>
  );
};
