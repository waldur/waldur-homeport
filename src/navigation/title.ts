import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';

import { ENV } from '@waldur/configs/default';
import { RootState } from '@waldur/store/reducers';

export const SET_TITLE = 'waldur/navigation/SET_TITLE';

interface SetTitleAction {
  type: typeof SET_TITLE;
  payload: {
    title: string;
    subtitle: string;
  };
}

const setTitle = (title: string, subtitle?: string): SetTitleAction => ({
  type: SET_TITLE,
  payload: {
    title,
    subtitle,
  },
});

export const reducer = (state = { title: '', subtitle: '' }, action) => {
  switch (action.type) {
    case SET_TITLE:
      return action.payload;

    default:
      return state;
  }
};

export function* effects() {
  yield takeEvery(SET_TITLE, (action: SetTitleAction) => {
    document.title =
      action.payload.title + ' | ' + ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE;
  });
}

export const getTitle = (state: RootState) => state.title.title;

export const useTitle = (title: string, subtitle?: string) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!title) {
      return;
    }
    dispatch(setTitle(title, subtitle));
    return () => {
      dispatch(setTitle('', ''));
    };
  }, [dispatch, title, subtitle]);
};
