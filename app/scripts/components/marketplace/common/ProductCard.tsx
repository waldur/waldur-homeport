import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { ProductCompareButtonContainer } from '@waldur/marketplace/compare/ProductCompareButtonContainer';

import { ProductButton } from '../common/ProductButton';
import { RatingStars } from '../common/RatingStars';
import { Product } from '../types';
import './ProductCard.scss';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = (props: ProductCardProps) => (
  <div className="product-card">
    <Link
      state="marketplace-product"
      className="product-thumb">
      <img src={props.product.thumb}/>
    </Link>
    <div className="product-card-body">
      <h3 className="product-title">
        <Link state="marketplace-product">
          {props.product.name}
        </Link>
      </h3>
      <div className="product-subtitle elipsis">
        {props.product.subtitle}
      </div>
      <RatingStars rating={props.product.rating}/>
      <span className="product-installs">
        {props.product.installs} installs
      </span>
    </div>
    <div className="product-button-group">
      <ProductButton icon="fa fa-comments" title="Write review"/>
      <ProductCompareButtonContainer product={props.product}/>
      <ShoppingCartButtonContainer product={props.product}/>
    </div>
  </div>
);
