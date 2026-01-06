import { FC } from 'react';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { RequestTypeAdmin } from './api';
import { RequestTypeDeleteAction } from './RequestTypeDeleteAction';
import { RequestTypeEditAction } from './RequestTypeEditAction';
import { RequestTypeToggleAction } from './RequestTypeToggleAction';

interface RequestTypeRowActionsProps {
  row: RequestTypeAdmin;
  refetch: () => void;
}

export const RequestTypeRowActions: FC<RequestTypeRowActionsProps> = ({
  row,
  refetch,
}) => {
  const actions = [
    RequestTypeToggleAction,
    RequestTypeEditAction,
    RequestTypeDeleteAction,
  ];

  return <ActionsDropdown row={row} refetch={refetch} actions={actions} />;
};
