import { ComponentType } from 'react';
import { useDispatch } from 'react-redux';

import { openModalDialog, closeModalDialog, AppModalProps } from './actions';
import { ModalAction } from './types';

export const useModal = () => {
  const dispatch = useDispatch();
  return {
    openDialog: <T>(component: ComponentType<T>, props: T & AppModalProps) => {
      dispatch(openModalDialog(component, props));
    },
    closeDialog: (type: ModalAction = 'HIDE_MODAL') => {
      dispatch(closeModalDialog(type));
    },
  };
};
