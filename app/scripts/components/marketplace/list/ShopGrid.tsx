import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import MediaQuery from 'react-responsive';

import { FilterBarContainer } from '@waldur/marketplace/common/FilterBarContainer';
import { OfferingGridContainer } from '@waldur/marketplace/common/OfferingGridContainer';

import AttributeFilterListContainer from './AttributeFilterListContainer';
import { MobileFilterActions } from './MobileFilterActions';
import { ShopCategoriesContainer } from './ShopCategoriesContainer';

export const ShopGrid = () => (
  <Row>
    <Col lg={3}>
      <ShopCategoriesContainer />
      <MediaQuery maxWidth={768}>
        <MobileFilterActions />
      </MediaQuery>
      <MediaQuery minWidth={768}>
        <AttributeFilterListContainer />
      </MediaQuery>
    </Col>
    <Col lg={9}>
      <div className="m-b-md p-sm gray-bg">
        <FilterBarContainer />
      </div>
      <OfferingGridContainer />
    </Col>
  </Row>
);
