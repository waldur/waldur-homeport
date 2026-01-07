import { FC } from 'react';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { IssueStatusAdmin } from './api';
import { IssueStatusDeleteAction } from './IssueStatusDeleteAction';
import { IssueStatusEditAction } from './IssueStatusEditAction';

interface IssueStatusRowActionsProps {
  row: IssueStatusAdmin;
  refetch: () => void;
}

export const IssueStatusRowActions: FC<IssueStatusRowActionsProps> = ({
  row,
  refetch,
}) => {
  const actions = [IssueStatusEditAction, IssueStatusDeleteAction];

  return <ActionsDropdown row={row} refetch={refetch} actions={actions} />;
};
