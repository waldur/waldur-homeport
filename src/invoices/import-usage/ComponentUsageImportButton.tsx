import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { isStaff } from '@waldur/workspace/selectors';

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
