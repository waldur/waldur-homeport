import React from 'react';
import { Card } from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const CategoryHelpArticles: React.FC = () => {
  return (
    <Card>
      <Card.Header>
        <div className="d-flex w-100 align-items-center">
          <h3>{translate('Help or promo articles')}</h3>
        </div>
      </Card.Header>
      <Card.Body>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="article-item d-flex align-items-center mb-6"
          >
            <ImagePlaceholder width="75px" height="75px" />
            <div className="ms-6">
              <Link
                state=""
                className="text-decoration-underline text-dark text-hover-primary fs-7"
              >
                Article {index}
              </Link>
            </div>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};
