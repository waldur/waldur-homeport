import { ActionsDropdown } from '@/table/ActionsDropdown';

import { QuickShortcutDeleteAction } from './QuickShortcutDeleteAction';
import { QuickShortcutEditAction } from './QuickShortcutEditAction';

export const QuickShortcutsRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[QuickShortcutEditAction, QuickShortcutDeleteAction].filter(
        Boolean,
      )}
    />
  );
};
