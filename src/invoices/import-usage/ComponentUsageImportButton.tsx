import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

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
  const user = useUser();
  const userIsStaff = user?.is_staff;

  if (!userIsStaff) {
    return null;
  }

  return (
    <BaseButton
      label={translate('Import usage')}
      onClick={() =>
        openDialog(ComponentUsageImportDialog, {
          size: 'lg',
          resolve: { refetch },
        })
      }
      iconNode={<UploadSimpleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
