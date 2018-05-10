import * as React from 'react';

import { ProductCard } from './ProductCard';

export const ProductGrid = props => (
  <div className="row">
    {props.products.map((product, index) => (
      <div key={index} className="col-md-3 col-sm-6">
        <ProductCard product={product}/>
      </div>
    ))}
  </div>
);
