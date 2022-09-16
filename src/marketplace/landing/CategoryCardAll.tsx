import { Card } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';
import './CategoryCard.scss';

const icon = require('@waldur/images/logo_w.svg');

export const CategoryCardAll = () => (
  <Card className="shadow-sm category-card">
    <Card.Body className="p-6">
      <Link state="marketplace-categories-profile" className="category-thumb">
        <InlineSVG path={icon} className="svg-icon-4x svg-icon-dark" />
      </Link>
      <div className="category-card-body">
        <h3 className="category-title">
          <Link
            state="marketplace-categories-profile"
            className="text-dark fw-bold text-hover-primary fs-6"
          >
            {translate('Browse all categories')}
          </Link>
        </h3>
      </div>
    </Card.Body>
  </Card>
);
