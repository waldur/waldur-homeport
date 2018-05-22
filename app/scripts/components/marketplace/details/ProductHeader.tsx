import * as React from 'react';

import { RatingStars } from '@waldur/marketplace/common/RatingStars';

export const ProductHeader = props => (
  <>
    <img src={props.product.thumb} className="img-xl"/>
    <RatingStars rating={props.product.rating} size="medium"/>
    <h4>{props.product.title}</h4>
    <p>by <a>{props.product.vendor}</a></p>
  </>
);
