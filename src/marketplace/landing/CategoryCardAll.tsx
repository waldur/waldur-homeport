import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { AllCategoriesLink } from '../links/AllCategoriesLink';
import '@waldur/marketplace/category/list/CategoryCard.scss';

export const CategoryCardAll = () => (
  <Card as={AllCategoriesLink} className="shadow-sm category-card">
    <Card.Body className="p-6">
      <div className="category-thumb" />
      <div className="category-card-body text-dark">
        <h3 className="category-title">
          <span className="fw-bold text-hover-primary fs-6">
            {translate('Browse all categories')}
          </span>
        </h3>
      </div>
    </Card.Body>
  </Card>
);
