import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

import { validateStaffAction } from '../actions/utils';

const SubmitReportDialog = lazyComponent(
  () => import('./SubmitReportDialog'),
  'SubmitReportDialog',
);

const validators = [validateState('OK', 'Erred'), validateStaffAction];

export const SubmitReportAction: ActionItemType = ({
  resource,
  refetch,
  marketplaceResource,
}) => {
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SUBMIT_RESOURCE_REPORT,
      customerId: resource.offering_customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <DialogActionItem
      validators={validators}
      title={translate('Submit report')}
      modalComponent={SubmitReportDialog}
      dialogSize="xl"
      resource={marketplaceResource || resource}
      extraResolve={{ refetch }}
    />
  );
};
