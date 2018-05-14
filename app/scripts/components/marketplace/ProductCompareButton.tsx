import * as React from 'react';

import { ProductButton } from './ProductButton';
import { Product } from './types';

interface ProductCompareButtonProps {
  product: Product;
  isCompared: boolean;
  addItem(): void;
  removeItem(): void;
}

export const ProductCompareButton = (props: ProductCompareButtonProps) => (
  <ProductButton
    icon="fa fa-balance-scale"
    isActive={props.isCompared}
    title={props.isCompared ? 'Remove from comparison' : 'Add to comparison'}
    onClick={() => props.isCompared ? props.removeItem() : props.addItem()}
  />
);
