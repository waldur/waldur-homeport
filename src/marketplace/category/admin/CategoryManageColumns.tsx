import { WrenchIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const CategoryManageColumnsDialog = lazyComponent(() =>
  import('./CategoryManageColumnsDialog').then((module) => ({
    default: module.CategoryManageColumnsDialog,
  })),
);

export const CategoryManageColumns = ({ row }: { row: Category }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(() => {
    dispatch(
      openModalDialog(CategoryManageColumnsDialog, {
        resolve: { category: row },
        size: 'xl',
      }),
    );
  }, [dispatch]);

  return (
    <ActionItem
      title={translate('Configure columns')}
      action={openFormDialog}
      iconNode={<WrenchIcon weight="bold" />}
    />
  );
};
