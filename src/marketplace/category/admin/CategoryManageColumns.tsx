import { WrenchIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const CategoryManageColumnsDialog = lazyComponent(() =>
  import('./CategoryManageColumnsDialog').then((module) => ({
    default: module.CategoryManageColumnsDialog,
  })),
);

export const CategoryManageColumns = ({ row }: { row: Category }) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(() => {
    openDialog(CategoryManageColumnsDialog, {
      resolve: { category: row },
      size: 'xl',
    });
  }, []);

  return (
    <ActionItem
      title={translate('Configure columns')}
      action={openFormDialog}
      iconNode={<WrenchIcon weight="bold" />}
    />
  );
};
