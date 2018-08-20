import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
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
      params={{product_uuid: props.product.uuid}}
      className="product-thumb">
      <img src={props.product.thumbnail}/>
    </Link>
    <div className="product-card-body">
      <h3 className="product-title">
        <Link
          state="marketplace-product"
          params={{product_uuid: props.product.uuid}}>
          {props.product.name}
        </Link>
      </h3>
      {props.product.subtitle && (
        <div className="product-subtitle ellipsis">
          {props.product.subtitle}
        </div>
      )}
      {props.product.rating && (
        <RatingStars rating={props.product.rating}/>
      )}
      {props.product.order_item_count ? (
        <span className="product-installs">
          {props.product.order_item_count} installs
        </span>
      ) : null}
    </div>
    <div className="product-button-group">
      <ProductButton icon="fa fa-comments" title={translate('Write review')}/>
      <ProductCompareButtonContainer product={props.product}/>
      <ShoppingCartButtonContainer product={props.product}/>
    </div>
  </div>
);
