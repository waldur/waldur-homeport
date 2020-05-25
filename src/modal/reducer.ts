const initialState = {
  modalComponent: null,
  modalProps: {},
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        modalComponent: action.modalComponent,
        modalProps: action.modalProps,
      };
    case 'HIDE_MODAL':
      return initialState;
    default:
      return state;
  }
};
