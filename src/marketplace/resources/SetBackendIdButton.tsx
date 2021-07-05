import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const SetBackendIdDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "SetBackendIdDialog" */ './SetBackendIdDialog'),
  'SetBackendIdDialog',
);

export const SetBackendIdButton: FC<any> = ({ resource, reInitResource }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  if (!isOwnerOrStaff && !isServiceManager) {
    return null;
  }
  return (
    <DialogActionButton
      title={translate('Set backend ID')}
      modalComponent={SetBackendIdDialog}
      extraResolve={{ reInitResource }}
      resource={resource}
    />
  );
};
