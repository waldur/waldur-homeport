import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { ProductGrid } from '@waldur/marketplace/common/ProductGrid';
import { Product, Category } from '@waldur/marketplace/types';

import { ShopCategories } from './ShopCategories';

interface ShopGridProps {
  products: Product[];
  categories: Category[];
}

export const ShopGrid = (props: ShopGridProps) => (
  <Row>
    <Col lg={3}>
      <ShopCategories categories={props.categories}/>
    </Col>
    <Col lg={9}>
      <ProductGrid products={props.products} width={4}/>
    </Col>
  </Row>
);
