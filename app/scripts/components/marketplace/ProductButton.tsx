import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

import './ProductButton.scss';

interface ProductButtonProps {
  icon: string;
  title: string;
}

export const ProductButton = (props: ProductButtonProps) => (
  <Tooltip label={props.title} id="product-button" className="product-button">
    <i className={props.icon}/>
  </Tooltip>
);
