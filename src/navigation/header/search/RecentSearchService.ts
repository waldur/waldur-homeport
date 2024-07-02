import { identity, isMatch, pickBy, uniqueId } from 'lodash';
import { useCallback, useState } from 'react';

import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

import { SearchItemProps } from './SearchItem';

const RECENT_SEARCH_KEY = 'waldur/search/recent';
const STORAGE_FOR_RECENT_SEARCH = 'localStorage';
const MAX_ALLOWED_ITEMS = 5;

interface RecentSearchItem {
  id: string;
  title: string;
  type: 'organization' | 'project' | 'resource';
  state: string;
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
    setItem(
      RECENT_SEARCH_KEY,
      JSON.stringify(newList),
      STORAGE_FOR_RECENT_SEARCH,
    );
  };

  list = (): RecentSearchItem[] => {
    const prevList = getItem(RECENT_SEARCH_KEY, STORAGE_FOR_RECENT_SEARCH);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch (error) {
        removeItem(RECENT_SEARCH_KEY, STORAGE_FOR_RECENT_SEARCH);
      }
    }
    return [];
  };

  remove = (item: RecentSearchItem) => {
    const prevList = this.list();
    const newList = prevList.filter((x) => x.id !== item.id);
    setItem(
      RECENT_SEARCH_KEY,
      JSON.stringify(newList),
      STORAGE_FOR_RECENT_SEARCH,
    );
  };
}

export const RecentSearchService = new RecentSearchServiceClass();

export const useRecentSearch = () => {
  const getRecentSearchList = () => RecentSearchService.list().reverse();
  const [recentSearchItems, setRecentSearchItems] = useState(() =>
    getRecentSearchList(),
  );

  const findRecentSearchItem = useCallback(
    (state, params) =>
      recentSearchItems.find(
        (x) =>
          x.state === state &&
          ((!x.params && !params) || isMatch(params, x.params)),
      ),
    [recentSearchItems],
  );

  const addRecentSearch = useCallback(
    (item: SearchItemProps, type: RecentSearchItem['type']) => {
      const recentItem: Omit<RecentSearchItem, 'id'> = {
        title: item.title,
        state: item.to,
        params: item.params,
        type,
      };
      event && event.preventDefault();
      recentItem.params = pickBy(recentItem.params, identity); // remove null and undefined properties
      if (findRecentSearchItem(recentItem.state, recentItem.params)) return;
      RecentSearchService.add(recentItem);
      setRecentSearchItems(getRecentSearchList());
      event && event.stopPropagation();
    },
    [
      recentSearchItems,
      setRecentSearchItems,
      getRecentSearchList,
      findRecentSearchItem,
    ],
  );

  return {
    recentSearchItems,
    addRecentSearch,
  };
};
