import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { openModalDialog } from '@waldur/modal/actions';

export const useModalDialogCallback = (
  modalComponent,
  dialogSize,
  resource,
  formId,
  extraResolve,
) => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(
      openModalDialog(modalComponent, {
        size: dialogSize,
        resolve: { resource, ...extraResolve },
        formId,
      }),
    );
  }, [dispatch, modalComponent, dialogSize, resource, formId, extraResolve]);
};
