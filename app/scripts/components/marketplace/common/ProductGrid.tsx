import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { Product } from '@waldur/marketplace/types';

import { ProductCard } from './ProductCard';

interface ProductGridProps {
  width?: number;
  products: Product[];
}

export const ProductGrid: React.SFC<ProductGridProps> = (props: ProductGridProps) => (
  <Row>
    {props.products.map((product, index) => (
      <Col key={index} md={props.width} sm={6}>
        <ProductCard product={product}/>
      </Col>
    ))}
  </Row>
);

ProductGrid.defaultProps = {
  width: 3,
};
