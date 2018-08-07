import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { Category } from '@waldur/marketplace/types';

import './CategoryCard.scss';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = (props: CategoryCardProps) => (
  <div className="category-card">
    <Link
      className="category-thumb"
      state="marketplace-list"
      params={{category_uuid: props.category.uuid}}
    >
      <img src={props.category.icon}/>
    </Link>
    <div className="category-card-body">
      <h3 className="category-title">
        <Link state="marketplace-list" params={{category_uuid: props.category.uuid}}>
          {props.category.title}
        </Link>
      </h3>
      {props.category.offering_count} items
    </div>
  </div>
);
