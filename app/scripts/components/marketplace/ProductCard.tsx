import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { ProductButton } from './ProductButton';
import './ProductCard.scss';
import { RatingStars } from './RatingStars';

interface ProductCardProps {
  rating: number;
  thumb: string;
  category: string;
  title: string;
  price: number;
}

export const ProductCard = (props: ProductCardProps) => (
  <div className="product-card">
    <RatingStars rating={props.rating}/>
    <a className="product-thumb">
      <img src={props.thumb}/>
    </a>
    <div className="product-card-body">
      <div className="product-category">
        <a>{props.category}</a>
      </div>
      <h3 className="product-title">
        <a>{props.title}</a>
      </h3>
      <h4 className="product-price">{props.price}</h4>
    </div>
    <div className="product-button-group">
      <ProductButton icon="icon-heart" title="Wishlist"/>
      <ProductButton icon="icon-repeat" title="Compare"/>
      <ProductButton icon="icon-shopping-cart" title="To Cart"/>
    </div>
  </div>
);

export default connectAngularComponent(ProductCard);
