import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { Category } from '@waldur/marketplace/types';

import './CategoryCard.scss';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = (props: CategoryCardProps) => (
  <div className="category-card">
    <Link className="category-thumb" state="marketplace-list">
      <img src={props.category.icon}/>
    </Link>
    <div className="category-card-body">
      <h3 className="category-title">
        <Link state="marketplace-list">
          {props.category.title}
        </Link>
      </h3>
      {props.category.counter} items
    </div>
  </div>
);
