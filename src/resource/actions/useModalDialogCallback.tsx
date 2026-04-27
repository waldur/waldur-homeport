import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AppModalProps, openModalDialog } from '@/modal/actions';

export const useModalDialogCallback = (
  modalComponent,
  resource,
  extraResolve?,
  modalProps?: AppModalProps,
) => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(
      openModalDialog(modalComponent, {
        ...modalProps,
        resolve: { resource, ...extraResolve },
      }),
    );
  }, [dispatch, modalComponent, resource, extraResolve, modalProps]);
};
