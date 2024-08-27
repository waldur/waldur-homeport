import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ADMIN_HOOK_LIST_ID } from './constants';

const HookDetailsDialog = lazyComponent(
  () => import('@waldur/user/hooks/HookDetailsDialog'),
  'HookDetailsDialog',
);

export const showHookUpdateDialog = (row?) =>
  openModalDialog(HookDetailsDialog, {
    resolve: { hook: row, listId: ADMIN_HOOK_LIST_ID },
    size: 'md',
  });

interface HookUpdateButtonProps {
  row: any;
}

export const HookUpdateButton: FunctionComponent<HookUpdateButtonProps> = ({
  row,
}) => {
  const dispatch = useDispatch();
  return (
    <EditButton
      label={translate('Update')}
      onClick={() => dispatch(showHookUpdateDialog(row))}
      size="sm"
    />
  );
};
