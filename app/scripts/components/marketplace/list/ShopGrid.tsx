import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { FilterBar } from '@waldur/marketplace/common/FilterBar';
import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { sections } from '@waldur/marketplace/fixtures';
import { Product, Category } from '@waldur/marketplace/types';

import { FeatureFilterList } from './FeatureFilterList';
import { ShopCategories } from './ShopCategories';

interface ShopGridProps {
  products: Product[];
  categories: Category[];
}

export const ShopGrid = (props: ShopGridProps) => (
  <Row>
    <Col lg={3}>
      <ShopCategories categories={props.categories}/>
      <FeatureFilterList sections={sections}/>
    </Col>
    <Col lg={9}>
      <div className="m-b-md p-sm gray-bg">
        <FilterBar/>
      </div>
      <ProductGrid products={props.products} width={4}/>
    </Col>
  </Row>
);
