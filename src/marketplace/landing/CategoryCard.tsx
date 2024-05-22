import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

import './CategoryCard.scss';

interface CategoryCardProps {
  item;
  as;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = (props) => (
  <Card as={props.as} item={props.item} className="shadow-sm category-card">
    <Card.Body className="p-6">
      <div className="category-thumb">
        <OfferingLogo src={props.item.icon} />
      </div>
      <div className="category-card-body text-dark">
        <h3 className="category-title">
          <span className="fw-bold text-hover-primary fs-6">
            {props.item.title}
          </span>
        </h3>
        {props.item.offering_count}{' '}
        {props.item.offering_count === 1
          ? translate('offering')
          : translate('offerings')}
      </div>
    </Card.Body>
  </Card>
);
