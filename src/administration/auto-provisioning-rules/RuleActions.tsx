import { ActionsDropdown } from '@/table/ActionsDropdown';

import { RuleAddTemplateButton } from './RuleAddTemplateButton';
import { RuleDeleteButton } from './RuleDeleteButton';
import { RuleDeleteTemplateButton } from './RuleDeleteTemplateButton';
import { RuleEditButton } from './RuleEditButton';

export const RuleActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      RuleEditButton,
      RuleAddTemplateButton,
      !!row.plan && RuleDeleteTemplateButton,
      RuleDeleteButton,
    ].filter(Boolean)}
    data-cy="rules-list-actions-dropdown-btn"
  />
);
