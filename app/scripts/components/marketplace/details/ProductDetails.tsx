import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { Product } from '@waldur/marketplace/types';

import { OrderSummary } from './OrderSummary';
import { ProductConfigurator } from './ProductConfigurator';
import './ProductDetails.scss';
import { ProductTabs } from './ProductTabs';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = (props: ProductDetailsProps) => (
  <div className="product-details">
    <Row>
      <Col md={9}>
        <h3>Product configuration</h3>
        <ProductConfigurator/>
      </Col>
      <Col md={3}>
        <h3>Order summary</h3>
        <OrderSummary product={props.product}/>
      </Col>
    </Row>
    <ProductTabs product={props.product}/>
  </div>
);
