import * as React from 'react';

export const useQuery = (method: any, variables?: Record<string, any>) => {
  const [state, setState] = React.useState({
    loading: false,
    loaded: false,
    erred: false,
    error: null,
    data: null,
  });
  const call = React.useCallback(() => {
    let didCancel = false;
    const safeSetState = param => {
      if (!didCancel) {
        setState(param);
      }
    };
    if (!method) {
      return;
    }
    safeSetState(prevState => ({
      ...prevState,
      loading: true,
      erred: false,
    }));
    method(variables).then(data => {
      safeSetState({
        data,
        loading: false,
        loaded: true,
        erred: false,
        error: undefined,
      });
    }).catch(error => {
      safeSetState(prevState => ({
        ...prevState,
        loading: false,
        erred: true,
        error,
      }));
    });
    return () => {
      didCancel = true;
    };
  }, [method, variables]);
  return {state, call};
};
