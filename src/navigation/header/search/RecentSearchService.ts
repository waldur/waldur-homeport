import { isMatch, pickBy, uniqueId } from 'lodash-es';
import { useCallback, useState } from 'react';

import { SearchItemProps } from './SearchItem';

const RECENT_SEARCH_KEY = 'waldur/search/recent';
const MAX_ALLOWED_ITEMS = 5;

interface RecentSearchItem {
  id: string;
  title: string;
  type: 'organization' | 'project' | 'resource' | 'user';
  to: string;
  params?: { [key: string]: string };
}

class RecentSearchServiceClass {
  add = (item: Omit<RecentSearchItem, 'id'>) => {
    const prevList = this.list();
    let id = uniqueId();
    while (prevList.some((p) => p.id === id)) {
      id = uniqueId();
    }
    const newItem = { ...item, id };
    const newList = prevList
      .slice(Math.max(0, prevList.length - MAX_ALLOWED_ITEMS + 1))
      .concat(newItem);
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(newList));
  };

  list = (): RecentSearchItem[] => {
    const prevList = localStorage.getItem(RECENT_SEARCH_KEY);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch {
        localStorage.removeItem(RECENT_SEARCH_KEY);
      }
    }
    return [];
  };

  remove = (item: RecentSearchItem) => {
    const prevList = this.list();
    const newList = prevList.filter((x) => x.id !== item.id);
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(newList));
  };

  clear = () => {
    localStorage.removeItem(RECENT_SEARCH_KEY);
  };
}

const RecentSearchService = new RecentSearchServiceClass();

export const useRecentSearch = () => {
  const getRecentSearchList = () => RecentSearchService.list().reverse();
  const [recentSearchItems, setRecentSearchItems] = useState(() =>
    getRecentSearchList(),
  );

  const findRecentSearchItem = useCallback(
    (to, params) =>
      recentSearchItems.find(
        (x) =>
          x.to === to && ((!x.params && !params) || isMatch(params, x.params)),
      ),
    [recentSearchItems],
  );

  const addRecentSearch = useCallback(
    (item: SearchItemProps, type: RecentSearchItem['type']) => {
      const recentItem: Omit<RecentSearchItem, 'id'> = {
        title: item.title,
        to: item.to,
        params: item.params,
        type,
      };
      if (event) event.preventDefault();
      recentItem.params = pickBy(recentItem.params, (x) => x !== null);
      if (findRecentSearchItem(recentItem.to, recentItem.params)) return;
      RecentSearchService.add(recentItem);
      setRecentSearchItems(getRecentSearchList());
      if (event) event.stopPropagation();
    },
    [
      recentSearchItems,
      setRecentSearchItems,
      getRecentSearchList,
      findRecentSearchItem,
    ],
  );

  const clearRecentSearches = useCallback(() => {
    RecentSearchService.clear();
    setRecentSearchItems([]);
  }, []);

  return {
    recentSearchItems,
    addRecentSearch,
    clearRecentSearches,
  };
};
