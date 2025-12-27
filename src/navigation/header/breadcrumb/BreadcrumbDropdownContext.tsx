import { createContext, useContext } from 'react';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';

interface BreadcrumbDropdownContextValue {
  addFavoritePage: ReturnType<typeof useFavoritePages>['addFavoritePage'];
  removeFavorite: ReturnType<typeof useFavoritePages>['removeFavorite'];
  isFavorite: ReturnType<typeof useFavoritePages>['isFavorite'];
  close: () => void;
}

export const BreadcrumbDropdownContext =
  createContext<BreadcrumbDropdownContextValue | null>(null);

export const useBreadcrumbDropdown = () => {
  const context = useContext(BreadcrumbDropdownContext);
  if (!context) {
    throw new Error(
      'useBreadcrumbDropdown must be used within BreadcrumbDropdown',
    );
  }
  return context;
};
