import { ActionsDropdown } from '@/table/ActionsDropdown';

import { TosDeleteAction } from './TosDeleteAction';
import { TosEditAction } from './TosEditAction';
import { TosViewAction } from './TosViewAction';

export const TosRowActions = ({ tos, refetch }) => (
  <ActionsDropdown
    row={tos}
    refetch={refetch}
    actions={[TosViewAction, TosEditAction, TosDeleteAction]}
  />
);
