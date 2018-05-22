import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { products } from '@waldur/marketplace/fixtures';
import { Product } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProductConfigurator } from './ProductConfigurator';
import { ProductHeader } from './ProductHeader';
import { ProductTabs } from './ProductTabs';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = (props: ProductDetailsProps) => (
  <>
    <h3 className="text-center m-b-md">
      {props.product.subtitle}
    </h3>
    <Row>
      <Col md={10}>
        <Row>
          <Col md={2}>
            <ProductHeader product={props.product}/>
          </Col>
          <Col md={10}>
            <ProductConfigurator/>
          </Col>
        </Row>
      </Col>
    </Row>
    <ProductTabs product={props.product}/>
  </>
);

const ProductDetailsPage = () => <ProductDetails product={products[0]}/>;

export default connectAngularComponent(ProductDetailsPage);
