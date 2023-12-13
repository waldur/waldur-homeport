import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { CategoryCard } from './CategoryCard';
import { CategoryCardAll } from './CategoryCardAll';
import { CategoriesQueryResult } from './hooks';

export const CategoriesList: FC<CategoriesQueryResult> = (props) => {
  if (props.isLoading) {
    return <LoadingSpinner />;
  }

  if (props.isError) {
    return (
      <h3 className="text-center">{translate('Unable to load categories.')}</h3>
    );
  }

  if (!props.data) {
    return (
      <h3 className="text-center">
        {translate('There are no categories in marketplace yet.')}
      </h3>
    );
  }

  return (
    <Row className="justify-content-center">
      {props.data.slice(0, 5).map((category, index) => (
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
