import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';

import { CategoryItem } from './CategoryItem';
import './ShopCategories.scss';

interface ShopCategoriesProps {
  categories: Category[];
  currentCategoryUuid?: string;
}

export const ShopCategories = (props: ShopCategoriesProps) => (
  <section>
    <h3 className="shopping-cart-sidebar-title">
      {translate('Categories')}
    </h3>
    <ul className="list-unstyled">
      {props.categories.map((category, index) => (
        <CategoryItem
          category={category}
          key={index}
          active={props.currentCategoryUuid === category.uuid}
        />
      ))}
    </ul>
  </section>
);
