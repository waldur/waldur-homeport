import { Card } from 'react-bootstrap';

import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';

import { AllCategoriesLink } from '../links/AllCategoriesLink';
import './CategoryCard.scss';

const icon = require('@waldur/images/logo_w.svg');

export const CategoryCardAll = () => (
  <Card as={AllCategoriesLink} className="shadow-sm category-card">
    <Card.Body className="p-6">
      <div className="category-thumb">
        <InlineSVG path={icon} className="svg-icon-4x svg-icon-dark" />
      </div>
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
