import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const SetBackendIdDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "SetBackendIdDialog" */ './SetBackendIdDialog'),
  'SetBackendIdDialog',
);

export const SetBackendIdAction: FC<any> = ({ resource, reInitResource }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  if (!isOwnerOrStaff && !isServiceManager) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Set backend ID')}
      modalComponent={SetBackendIdDialog}
      extraResolve={{ reInitResource }}
      resource={resource}
    />
  );
};
