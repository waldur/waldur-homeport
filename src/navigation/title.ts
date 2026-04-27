import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@/core/config';
import { type RootState } from '@/store/reducers';

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
      // Side effect: update browser tab title
      if (action.payload.as !== 'page') {
        document.title =
          action.payload.title +
          ' | ' +
          ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE;
      }
      // State update: update page title
      if (action.payload.as !== 'browser') {
        return action.payload;
      }
      return state;

    default:
      return state;
  }
};

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
