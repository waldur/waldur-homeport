import { ActionsDropdown } from '@/table/ActionsDropdown';

import { IssueTemplateDeleteAction } from './IssueTemplateDeleteAction';
import { IssueTemplateEditAction } from './IssueTemplateEditAction';

export const IssueTemplateRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[IssueTemplateEditAction, IssueTemplateDeleteAction].filter(
        Boolean,
      )}
    />
  );
};
