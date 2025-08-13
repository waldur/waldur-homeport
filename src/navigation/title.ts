import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';

import { ENV } from '@waldur/core/config';
import { type RootState } from '@waldur/store/reducers';

const SET_TITLE = 'waldur/navigation/SET_TITLE';

type TitleAs = 'both' | 'page' | 'browser';

interface SetTitleAction {
  type: typeof SET_TITLE;
  payload: {
    title: string;
    subtitle: string;
    as: TitleAs;
  };
}

const setTitle = (
  title: string,
  subtitle?: string,
  as?: TitleAs,
): SetTitleAction => ({
  type: SET_TITLE,
  payload: {
    title,
    subtitle,
    as,
  },
});

export const reducer = (state = { title: '', subtitle: '' }, action) => {
  switch (action.type) {
    case SET_TITLE:
      if (action.payload.as !== 'browser') {
        return action.payload;
      }
      return state;

    default:
      return state;
  }
};

export function* effects() {
  yield takeEvery(SET_TITLE, (action: SetTitleAction) => {
    if (action.payload.as !== 'page') {
      document.title =
        action.payload.title + ' | ' + ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE;
    }
  });
}

export const getTitle = (state: RootState) => state.title.title;

export const useTitle = (
  title: string,
  subtitle?: string,
  as: TitleAs = 'both',
) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!title) {
      return;
    }
    dispatch(setTitle(title, subtitle, as));
    return () => {
      dispatch(setTitle('', ''));
    };
  }, [dispatch, title, subtitle]);
};
