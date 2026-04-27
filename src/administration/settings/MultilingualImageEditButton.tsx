import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';

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
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(MultilingualImageEditDialog, {
          resolve: { item, initialValues: value },
          size: 'lg',
        }),
      ),
    [dispatch, item, value],
  );

  return <CompactEditButton onClick={openFormDialog} />;
};
