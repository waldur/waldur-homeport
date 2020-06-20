import * as React from 'react';
import { useDispatch } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';

import { ENV } from '@waldur/core/services';

const SET_TITLE = 'waldur/navigation/SET_TITLE';

interface SetTitleAction {
  type: typeof SET_TITLE;
  payload: {
    title: string;
  };
}

export const setTitle = (title: string): SetTitleAction => ({
  type: SET_TITLE,
  payload: {
    title,
  },
});

export const reducer = (state = '', action) => {
  switch (action.type) {
    case SET_TITLE:
      return action.payload.title;

    default:
      return state;
  }
};

export function* effects() {
  yield takeEvery(SET_TITLE, (action: SetTitleAction) => {
    document.title = ENV.shortPageTitle + ' | ' + action.payload.title;
  });
}

export const getTitle = (state) => state.title;

export const useTitle = (title) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (!title) {
      return;
    }
    dispatch(setTitle(title));
  }, [dispatch, title]);
};
