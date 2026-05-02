import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

const MultilingualImageEditDialog = lazyComponent(() =>
  import('./MultilingualImageEditDialog').then((module) => ({
    default: module.MultilingualImageEditDialog,
  })),
);

interface MultilingualImageEditButtonProps {
  item: { key: string; description: string; type: string };
  value: Record<string, string>;
}

export const MultilingualImageEditButton = ({
  item,
  value,
}: MultilingualImageEditButtonProps) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () =>
      openDialog(MultilingualImageEditDialog, {
        resolve: { item, initialValues: value },
        size: 'lg',
      }),
    [item, value],
  );

  return <CompactEditButton onClick={openFormDialog} />;
};
