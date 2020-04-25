import * as React from 'react';

interface QueryState<PayloadType = any> {
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  error: any;
  data: PayloadType;
}

interface QueryInterface<PayloadType = any> {
  state: QueryState<PayloadType>;
  call(): void;
}

type LoaderInterface<VariablesType, PayloadType> = (
  vars?: VariablesType,
) => Promise<PayloadType>;

/**
 * @deprecated Please use useAsync hook instead from react-use package.
 */
export function useQuery<
  PayloadType = any,
  VariablesType = string | Record<string, any>
>(
  method?: LoaderInterface<VariablesType, PayloadType>,
  variables?: VariablesType,
): QueryInterface<PayloadType> {
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
    (method(variables) as Promise<PayloadType>)
      .then(data => {
        safeSetState({
          data,
          loading: false,
          loaded: true,
          erred: false,
          error: undefined,
        });
      })
      .catch(error => {
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
  return { state, call };
}
