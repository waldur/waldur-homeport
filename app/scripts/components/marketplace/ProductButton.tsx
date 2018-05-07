import * as React from 'react';

import './ProductButton.scss';

interface ProductButtonProps {
  icon: string;
  title: string;
}

export const ProductButton = (props: ProductButtonProps) => (
  <a className="product-button">
    <i className={props.icon}/>
    <span>{props.title}</span>
  </a>
);
