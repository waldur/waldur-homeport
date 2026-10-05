import { FC } from 'react';

import { ActionsMenu } from '@/table/ActionsDropdown';

import { CostPolicyDeleteButton } from './CostPolicyDeleteButton';
import { CostPolicyDuplicateButton } from './CostPolicyDuplicateButton';
import { CostPolicyEditButton } from './CostPolicyEditButton';
import { CostPolicyType } from './types';

interface CostPolicyActionsProps {
  row;
  refetch(): void;
  type: CostPolicyType;
}

export const CostPolicyActions: FC<CostPolicyActionsProps> = (props) => (
  <ActionsMenu>
    <CostPolicyEditButton {...props} />
    <CostPolicyDuplicateButton {...props} />
    <CostPolicyDeleteButton {...props} />
  </ActionsMenu>
);
