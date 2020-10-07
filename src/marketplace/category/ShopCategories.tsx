import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';

import { CategoryItem } from './CategoryItem';
import './ShopCategories.scss';

interface ShopCategoriesProps {
  categories: Category[];
  currentCategoryUuid?: string;
}

const getSortedCategoriesByTitle = (categories: Category[]): Category[] =>
  categories.sort((a, b) =>
    a.title > b.title ? 1 : b.title > a.title ? -1 : 0,
  );

export const ShopCategories = (props: ShopCategoriesProps) => {
  const sortedCategories = getSortedCategoriesByTitle(props.categories);
  return (
    <section>
      <h3 className="shopping-cart-sidebar-title">{translate('Categories')}</h3>
      <ul className="list-unstyled">
        {sortedCategories.map((category, index) => (
          <CategoryItem
            category={category}
            key={index}
            active={props.currentCategoryUuid === category.uuid}
          />
        ))}
      </ul>
    </section>
  );
};
