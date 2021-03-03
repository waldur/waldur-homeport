import { FunctionComponent } from 'react';

import { Category } from '@waldur/marketplace-checklist/types';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

import '@waldur/marketplace/landing/CategoryCard.scss';

import { CategoryLink } from './CategoryLink';

interface CategoryUserCardProps {
  category: Category;
}

export const CategoryUserCard: FunctionComponent<CategoryUserCardProps> = (
  props,
) => (
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
