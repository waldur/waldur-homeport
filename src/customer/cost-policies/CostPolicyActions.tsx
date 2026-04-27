import { FC } from 'react';

import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { CostPolicyDeleteButton } from './CostPolicyDeleteButton';
import { CostPolicyEditButton } from './CostPolicyEditButton';
import { CostPolicyType } from './types';

interface CostPolicyActionsProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyActions: FC<CostPolicyActionsProps> = (props) => (
  <ActionsDropdownComponent>
    <CostPolicyEditButton {...props} />
    <CostPolicyDeleteButton {...props} />
  </ActionsDropdownComponent>
);
