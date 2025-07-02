import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const HookDetailsDialog = lazyComponent(() =>
  import('@waldur/user/hooks/HookDetailsDialog').then((module) => ({
    default: module.HookDetailsDialog,
  })),
);

const showHookUpdateDialog = (row?, refetch?) =>
  openModalDialog(HookDetailsDialog, {
    resolve: { hook: row, refetch },
    size: 'lg',
  });

interface HookUpdateButtonProps {
  row: any;
  refetch?: () => void;
}

export const HookUpdateButton: FunctionComponent<HookUpdateButtonProps> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();
  return (
    <EditAction
      label={translate('Update')}
      action={() => dispatch(showHookUpdateDialog(row, refetch))}
      size="sm"
    />
  );
};
