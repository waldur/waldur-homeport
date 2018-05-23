import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { Product } from '@waldur/marketplace/types';

import { ProductConfigurator } from './ProductConfigurator';
import { ProductHeader } from './ProductHeader';
import { ProductTabs } from './ProductTabs';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = (props: ProductDetailsProps) => (
  <>
    <Row>
      <Col md={10}>
        <ProductConfigurator/>
      </Col>
      <Col md={2}>
        <ProductHeader product={props.product}/>
      </Col>
    </Row>
    <ProductTabs product={props.product}/>
  </>
);
