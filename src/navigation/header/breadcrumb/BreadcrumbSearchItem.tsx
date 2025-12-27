import { SearchItem, SearchItemProps } from '../search/SearchItem';

import { useBreadcrumbDropdown } from './BreadcrumbDropdownContext';

interface BreadcrumbSearchItemProps extends Omit<
  SearchItemProps,
  'addFavoritePage' | 'removeFavorite' | 'isFavorite' | 'onClick'
> {
  /** Whether this item is the currently active/selected item */
  isCurrent?: boolean;
}

/**
 * A SearchItem wrapper for breadcrumb dropdowns that:
 * - Highlights the current item with bg-light-primary
 * - Automatically handles favorite page functionality via context
 * - Automatically handles close callback via context
 */
export const BreadcrumbSearchItem = ({
  isCurrent,
  ...props
}: BreadcrumbSearchItemProps) => {
  const { addFavoritePage, removeFavorite, isFavorite, close } =
    useBreadcrumbDropdown();

  return (
    <div className={isCurrent ? 'bg-light-primary' : ''}>
      <SearchItem
        {...props}
        addFavoritePage={addFavoritePage}
        removeFavorite={removeFavorite}
        isFavorite={isFavorite}
        onClick={close}
      />
    </div>
  );
};
