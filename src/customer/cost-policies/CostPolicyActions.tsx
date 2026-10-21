import { FC } from 'react';

import { ActionsMenu } from '@/table/ActionsDropdown';
import { VersionHistoryButton } from '@/version-history';

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
    <VersionHistoryButton
      entityType={
        props.type === 'project'
          ? 'project_cost_policy'
          : 'customer_cost_policy'
      }
      entityUuid={props.row.uuid}
      entityName={props.row.scope_name}
      asDropdownItem
    />
    <CostPolicyDeleteButton {...props} />
  </ActionsMenu>
);
