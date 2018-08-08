import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FilterBarContainer } from '@waldur/marketplace/common/FilterBarContainer';
import { ProductGridContainer } from '@waldur/marketplace/common/ProductGridContainer';
import { Category } from '@waldur/marketplace/types';

import FeatureFilterListContainer from './FeatureFilterListContainer';
import { ShopCategories } from './ShopCategories';

interface ShopGridProps {
  categories: Category[];
}

export const ShopGrid = (props: ShopGridProps) => (
  <Row>
    <Col lg={3}>
      <ShopCategories categories={props.categories}/>
      <FeatureFilterListContainer />
    </Col>
    <Col lg={9}>
      <div className="m-b-md p-sm gray-bg">
        <FilterBarContainer />
      </div>
      <ProductGridContainer />
    </Col>
  </Row>
);
