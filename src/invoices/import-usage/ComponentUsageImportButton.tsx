import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
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
  const { openDialog } = useModal();
  const userIsStaff = useSelector(isStaff);

  if (!userIsStaff) {
    return null;
  }

  return (
    <ActionButton
      title={translate('Import usage')}
      action={() =>
        openDialog(ComponentUsageImportDialog, {
          size: 'lg',
          resolve: { refetch },
        })
      }
      iconNode={<UploadSimpleIcon weight="bold" />}
    />
  );
};
