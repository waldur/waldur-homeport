import React from 'react';

import '@waldur/marketplace/landing/CategoryCard.scss';
import { Category } from '@waldur/marketplace-checklist/types';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

import { CategoryLink } from './CategoryLink';

interface CategoryUserCardProps {
  category: Category;
}

export const CategoryUserCard = (props: CategoryUserCardProps) => (
  <div className="category-card" style={{ height: '122px' }}>
    <CategoryLink
      className="category-thumb"
      category_uuid={props.category.uuid}
    >
      <OfferingLogo src={props.category.icon} />
    </CategoryLink>
    <div className="category-card-body">
      <h3 className="category-title">
        <CategoryLink category_uuid={props.category.uuid}>
          {props.category.name}
        </CategoryLink>
      </h3>
    </div>
  </div>
);
