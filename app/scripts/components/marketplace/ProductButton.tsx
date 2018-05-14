import * as classNames from 'classnames';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

import './ProductButton.scss';

interface ProductButtonProps {
  icon: string;
  title: string;
  onClick?(): void;
  isActive?: boolean;
}

export const ProductButton = (props: ProductButtonProps) => (
  <Tooltip
    label={props.title}
    id="product-button"
    className={classNames('product-button', {'product-button-active': props.isActive})}
    onClick={props.onClick}>
    <i className={props.icon}/>
  </Tooltip>
);
