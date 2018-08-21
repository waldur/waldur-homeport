import * as React from 'react';

import { OfferingButton } from '../common/OfferingButton';
import { Offering } from '../types';

interface OfferingCompareButtonProps {
  offering: Offering;
  isCompared: boolean;
  addItem(): void;
  removeItem(): void;
}

export const OfferingCompareButton = (props: OfferingCompareButtonProps) => (
  <OfferingButton
    icon="fa fa-balance-scale"
    isActive={props.isCompared}
    title={props.isCompared ? 'Remove from comparison' : 'Add to comparison'}
    onClick={() => props.isCompared ? props.removeItem() : props.addItem()}
  />
);
