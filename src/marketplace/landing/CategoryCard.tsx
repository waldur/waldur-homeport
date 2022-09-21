import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { CategoryLink } from '@waldur/marketplace/links/CategoryLink';
import { Category } from '@waldur/marketplace/types';
import './CategoryCard.scss';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = (props) => (
  <Card
    as={CategoryLink}
    category_uuid={props.category.uuid}
    className="shadow-sm category-card"
  >
    <Card.Body className="p-6">
      <div className="category-thumb">
        <OfferingLogo src={props.category.icon} />
      </div>
      <div className="category-card-body text-dark">
        <h3 className="category-title">
          <span className="fw-bold text-hover-primary fs-6">
            {props.category.title}
          </span>
        </h3>
        {props.category.offering_count}{' '}
        {props.category.offering_count === 1
          ? translate('offering')
          : translate('offerings')}
      </div>
    </Card.Body>
  </Card>
);
