import { useDispatch } from 'react-redux';

import { showError, showErrorResponse, showSuccess } from './notify';

export const useNotify = () => {
  const dispatch = useDispatch();
  return {
    showSuccess: (message, title?) => dispatch(showSuccess(message, title)),
    showError: (message) => dispatch(showError(message)),
    showErrorResponse: (error, message = null) =>
      dispatch(showErrorResponse(error, message)),
  };
};
