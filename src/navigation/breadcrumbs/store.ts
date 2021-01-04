import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { BreadcrumbItem } from './types';

const SET_BREADCRUMBS = 'waldur/navigation/SET_BREADCRUMBS';

interface SetBreadcrumbsAction {
  type: typeof SET_BREADCRUMBS;
  payload: {
    items: BreadcrumbItem[];
  };
}

export const setBreadcrumbs = (
  items: BreadcrumbItem[],
): SetBreadcrumbsAction => ({
  type: SET_BREADCRUMBS,
  payload: {
    items,
  },
});

type BreadcrumbState = BreadcrumbItem[];

export const reducer = (
  state: BreadcrumbState = [],
  action,
): BreadcrumbState => {
  switch (action.type) {
    case SET_BREADCRUMBS:
      return action.payload.items;

    default:
      return state;
  }
};

export const getBreadcrumbs = (state: RootState) => state.breadcrumbs;

export const useBreadcrumbs = (items: BreadcrumbItem[]) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (items) {
      dispatch(setBreadcrumbs(items));
    }
  }, [dispatch, items]);
};

export const useBreadcrumbsFn = (fn: () => BreadcrumbItem[], deps?) => {
  const breadcrumbs = useMemo(fn, deps);
  useBreadcrumbs(breadcrumbs);
};
