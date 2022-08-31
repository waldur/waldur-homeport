import { Card, Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CategoriesListType } from '@waldur/marketplace/types';

import { CategoryCard } from './CategoryCard';

export const CategoriesList = (props: CategoriesListType) => {
  return (
    <Card className="mb-6">
      <Card.Header>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <h3>{translate('All categories')}</h3>
          <Link
            state=""
            className="text-decoration-underline text-dark text-hover-primary fs-7"
          >
            {translate('View all offerings')}
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        {props.loading ? (
          <LoadingSpinner />
        ) : !props.loaded ? (
          <h3 className="text-center">
            {translate('Unable to load categories.')}
          </h3>
        ) : !props.items ? (
          <h3 className="text-center">
            {translate('There are no categories in marketplace yet.')}
          </h3>
        ) : (
          <Row>
            {props.items.map((category, index) => (
              <Col key={index} xl={3} lg={4} sm={6}>
                <CategoryCard category={category} />
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};
