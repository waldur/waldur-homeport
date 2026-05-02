import { useCallback } from 'react';

import { AppModalProps } from '@/modal/actions';
import { useModal } from '@/modal/actions';

export const useModalDialogCallback = (
  modalComponent,
  resource,
  extraResolve?,
  modalProps?: AppModalProps,
) => {
  const { openDialog } = useModal();
  return useCallback(() => {
    openDialog(modalComponent, {
      ...modalProps,
      resolve: { resource, ...extraResolve },
    });
  }, [modalComponent, resource, extraResolve, modalProps]);
};
