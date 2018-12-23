import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CategoriesListType } from '@waldur/marketplace/types';

import { CategoryCard } from './CategoryCard';

interface CategoriesListProps extends TranslateProps, CategoriesListType {}

export const CategoriesList = withTranslation((props: CategoriesListProps) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  }

  if (!props.loaded) {
    return (
      <h3 className="text-center">
        {props.translate('Unable to load marketplace categories.')}
      </h3>
    );
  }

  if (props.loaded && !props.items) {
    return (
      <h3 className="text-center">
        {props.translate('There are no categories in marketplace yet.')}
      </h3>
    );
  }

  return (
    <Row>
      {props.items.map((category, index) => (
        <Col key={index} md={2} sm={6}>
          <CategoryCard category={category}/>
        </Col>
      ))}
    </Row>
  );
});
