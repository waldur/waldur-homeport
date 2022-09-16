import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CategoriesListType } from '@waldur/marketplace/types';

import { CategoryCard } from './CategoryCard';
import { CategoryCardAll } from './CategoryCardAll';

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
    <Row className="justify-content-center">
      {props.items.slice(0, 5).map((category, index) => (
        <Col key={index} xxl={2} xl={3} lg={4} sm={6}>
          <CategoryCard category={category} />
        </Col>
      ))}
      <Col xxl={2} xl={3} lg={4} sm={6}>
        <CategoryCardAll />
      </Col>
    </Row>
  );
};
