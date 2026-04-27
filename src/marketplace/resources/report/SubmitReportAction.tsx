import { FileTextIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { getUser } from '@/workspace/selectors';

import { ResourceAction } from '../actions/constants';
import { validateStaffAction } from '../actions/utils';

const SubmitReportDialog = lazyComponent(() =>
  import('./SubmitReportDialog').then((module) => ({
    default: module.SubmitReportDialog,
  })),
);

const validators = [validateState('OK', 'ERRED'), validateStaffAction];

export const SubmitReportAction: ActionItemType = ({
  resource,
  refetch,
  marketplaceResource,
}) => {
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SUBMIT_RESOURCE_REPORT,
      customerId: resource.provider_uuid,
    })
  ) {
    return null;
  }
  return (
    <DialogActionItem
      validators={validators}
      title={translate('Submit report')}
      iconNode={<FileTextIcon weight="bold" />}
      modalComponent={SubmitReportDialog}
      dialogSize="xl"
      resource={marketplaceResource || resource}
      extraResolve={{ refetch }}
      actionId={ResourceAction.SUBMIT_REPORT}
    />
  );
};
