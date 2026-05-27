import { useEffect } from 'react';

import { ENV } from '@/core/config';

type TitleAs = 'both' | 'page' | 'browser';

let currentTitle = '';
let currentSubtitle = '';

export const getTitle = () => currentTitle;

export const getSubtitle = () => currentSubtitle;

export const useTitle = (
  title: string,
  subtitle?: string,
  as: TitleAs = 'both',
) => {
  useEffect(() => {
    if (!title) {
      return;
    }

    // State update: update page title
    if (as !== 'browser') {
      currentTitle = title;
      currentSubtitle = subtitle || '';
    }

    // Side effect: update browser tab title
    if (as !== 'page') {
      document.title = title + ' | ' + ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE;
    }

    return () => {
      if (as !== 'browser') {
        currentTitle = '';
        currentSubtitle = '';
      }
      if (as !== 'page') {
        document.title = ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE;
      }
    };
  }, [title, subtitle, as]);
};
