import * as React from 'react';
import { useDispatch } from 'react-redux';

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

export const reducer = (state = [], action) => {
  switch (action.type) {
    case SET_BREADCRUMBS:
      return action.payload.items;

    default:
      return state;
  }
};

export const getBreadcrumbs = (state) => state.breadcrumbs as BreadcrumbItem[];

export const useBreadcrumbs = (items: BreadcrumbItem[]) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (items) {
      dispatch(setBreadcrumbs(items));
    }
  }, [dispatch, items]);
};

export const useBreadcrumbsFn = (fn: () => BreadcrumbItem[], deps?) => {
  const breadcrumbs = React.useMemo(fn, deps);
  useBreadcrumbs(breadcrumbs);
};
