import { uniqueId } from 'lodash';

import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';
import { Customer, Project, UserDetails } from '@waldur/workspace/types';

const FAVORITE_PAGES_KEY = 'waldur/favorite/pages';

export interface FavoritePage {
  id: string;
  title: string;
  subtitle: string;
  state: string;
  params?: { [key: string]: string };
  url: string;
  image?: string;
}

export interface FavoritePageContext {
  customer?: Customer;
  user?: UserDetails;
  project?: Project;
}

class FavoritePageServiceClass {
  add = (page: Omit<FavoritePage, 'id'>) => {
    const prevList = this.list();
    let id = uniqueId();
    while (prevList.some((p) => p.id === id)) {
      id = uniqueId();
    }
    const newPage = { ...page, id };
    setItem(FAVORITE_PAGES_KEY, JSON.stringify(prevList.concat(newPage)));
  };

  list = (): FavoritePage[] => {
    const prevList = getItem(FAVORITE_PAGES_KEY);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch (error) {
        removeItem(FAVORITE_PAGES_KEY);
      }
    }
    return [];
  };

  remove = (page: FavoritePage) => {
    const prevList = this.list();
    const newList = prevList.filter((p) => p.id !== page.id);
    setItem(FAVORITE_PAGES_KEY, JSON.stringify(newList));
  };
}

export const FavoritePageService = new FavoritePageServiceClass();
