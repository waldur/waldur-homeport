import { ActionsDropdown } from '@/table/ActionsDropdown';

import { SramRuleDeleteButton } from './SramRuleDeleteButton';
import { SramRuleDuplicateButton } from './SramRuleDuplicateButton';
import { SramRuleEditButton } from './SramRuleEditButton';
import { SramRulePreviewButton } from './SramRulePreviewButton';

const ACTIONS = [
  SramRuleEditButton,
  SramRuleDuplicateButton,
  SramRulePreviewButton,
  SramRuleDeleteButton,
];

export const SramRuleActions = ({ row, refetch }) => (
  <ActionsDropdown row={row} refetch={refetch} actions={ACTIONS} />
);
