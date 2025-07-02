import { ModalAction } from './types';

const initialModalState = {
  modalComponent: null,
  modalProps: {},
};

const initialConfirmState = {
  confirmComponent: null,
  confirmProps: {},
};

const initialState = {
  ...initialModalState,
  ...initialConfirmState,
};

export const reducer = (state = initialState, action) => {
  switch (action.type satisfies ModalAction) {
    case 'SHOW_MODAL':
      return {
        ...state,
        modalComponent: action.modalComponent,
        modalProps: action.modalProps,
      };
    case 'HIDE_MODAL':
      return { ...state, ...initialModalState };

    case 'SHOW_CONFIRM':
      return {
        ...state,
        confirmComponent: action.modalComponent,
        confirmProps: action.modalProps,
      };
    case 'HIDE_CONFIRM':
      return { ...state, ...initialConfirmState };
    default:
      return state;
  }
};
