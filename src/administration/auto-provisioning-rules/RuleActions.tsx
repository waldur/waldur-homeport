import { ActionsDropdown } from '@/table/ActionsDropdown';

import { RuleAddTemplateButton } from './RuleAddTemplateButton';
import { RuleDeleteButton } from './RuleDeleteButton';
import { RuleDeleteTemplateButton } from './RuleDeleteTemplateButton';
import { RuleDuplicateButton } from './RuleDuplicateButton';
import { RuleEditButton } from './RuleEditButton';
import { RuleTestMatchButton } from './RuleTestMatchButton';

export const RuleActions = ({ row, refetch }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      RuleEditButton,
      RuleDuplicateButton,
      RuleTestMatchButton,
      RuleAddTemplateButton,
      !!row.plan && RuleDeleteTemplateButton,
      RuleDeleteButton,
    ].filter(Boolean)}
  />
);
