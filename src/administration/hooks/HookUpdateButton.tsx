import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButtonSmall } from '@waldur/table/ActionButtonSmall';

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
    <ActionButtonSmall
      title={translate('Update')}
      action={() => dispatch(showHookUpdateDialog(row))}
      className="btn btn-secondary"
    >
      <i className="fa fa-pencil" />
    </ActionButtonSmall>
  );
};
