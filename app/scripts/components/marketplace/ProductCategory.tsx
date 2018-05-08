import * as React from 'react';

import { ProductGrid } from './ProductGrid';

export const ProductCategory = props => (
  <div>
    <h2>{props.category.header}</h2>
    <h3>{props.category.subheader}</h3>
    <ProductGrid products={props.category.products}/>
  </div>
);
