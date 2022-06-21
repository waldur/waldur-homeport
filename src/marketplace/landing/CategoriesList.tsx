import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CategoriesListType } from '@waldur/marketplace/types';

import { CategoryCard } from './CategoryCard';

export const CategoriesList = (props: CategoriesListType) => {
  if (props.loading) {
    return <LoadingSpinner />;
  }

  if (!props.loaded) {
    return (
      <h3 className="text-center">{translate('Unable to load categories.')}</h3>
    );
  }

  if (!props.items) {
    return (
      <h3 className="text-center">
        {translate('There are no categories in marketplace yet.')}
      </h3>
    );
  }

  return (
    <Row>
      {props.items.map((category, index) => (
        <Col key={index} md={2} sm={6}>
          <CategoryCard category={category} />
        </Col>
      ))}
    </Row>
  );
};
