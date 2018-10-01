import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';
import { Offering } from '@waldur/marketplace/types';

interface OfferingCompareButtonProps {
  offering: Offering;
  isCompared: boolean;
  addItem(): void;
  removeItem(): void;
  flavor?: 'primary' | 'secondary' | 'ternary';
}

export const OfferingCompareButton = (props: OfferingCompareButtonProps) => (
  <OfferingButton
    icon="fa fa-balance-scale"
    isActive={props.isCompared}
    title={props.isCompared ? translate('Remove from comparison') : translate('Add to comparison')}
    onClick={() => props.isCompared ? props.removeItem() : props.addItem()}
    flavor={props.flavor}
  />
);
