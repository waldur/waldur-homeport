import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { isStaff } from '@/workspace/selectors';

const ComponentUsageImportDialog = lazyComponent(() =>
  import('./ComponentUsageImportDialog').then((module) => ({
    default: module.ComponentUsageImportDialog,
  })),
);

interface ComponentUsageImportButtonProps {
  refetch?: () => void;
}

export const ComponentUsageImportButton: FC<
  ComponentUsageImportButtonProps
> = ({ refetch }) => {
  const dispatch = useDispatch();
  const userIsStaff = useSelector(isStaff);

  if (!userIsStaff) {
    return null;
  }

  return (
    <ActionButton
      title={translate('Import usage')}
      action={() =>
        dispatch(
          openModalDialog(ComponentUsageImportDialog, {
            size: 'lg',
            resolve: { refetch },
          }),
        )
      }
      iconNode={<UploadSimpleIcon weight="bold" />}
    />
  );
};
