import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FilterBarContainer } from '@waldur/marketplace/common/FilterBarContainer';
import { OfferingGridContainer } from '@waldur/marketplace/common/OfferingGridContainer';

import FeatureFilterListContainer from './FeatureFilterListContainer';
import { ShopCategoriesContainer } from './ShopCategoriesContainer';

export const ShopGrid = () => (
  <Row>
    <Col lg={3}>
      <ShopCategoriesContainer />
      <FeatureFilterListContainer />
    </Col>
    <Col lg={9}>
      <div className="m-b-md p-sm gray-bg">
        <FilterBarContainer />
      </div>
      <OfferingGridContainer />
    </Col>
  </Row>
);
