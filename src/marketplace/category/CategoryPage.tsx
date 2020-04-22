import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import MediaQuery from 'react-responsive';

import { AttributeFilterListContainer } from './filters/AttributeFilterListContainer';
import { FilterBarContainer } from './filters/FilterBarContainer';
import { MobileFilterActions } from './filters/MobileFilterActions';
import { OfferingGridContainer } from './OfferingGridContainer';
import { ShopCategoriesContainer } from './ShopCategoriesContainer';

export const CategoryPage = () => (
  <Row>
    <Col lg={3}>
      <ShopCategoriesContainer />
      <MediaQuery minWidth={768}>
        <AttributeFilterListContainer />
      </MediaQuery>
    </Col>
    <Col lg={9}>
      <div className="m-b-md p-sm gray-bg">
        <div style={{ display: 'flex' }}>
          <FilterBarContainer />
          <MediaQuery maxWidth={768}>
            <MobileFilterActions />
          </MediaQuery>
        </div>
      </div>
      <OfferingGridContainer />
    </Col>
  </Row>
);
