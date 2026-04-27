import { useSelector } from 'react-redux';

import { BroadcastTemplateDeleteButton } from '@/broadcasts/BroadcastTemplateDeleteButton';
import { BroadcastTemplateUpdateButton } from '@/broadcasts/BroadcastTemplateUpdateButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

export const BroadcastTemplateActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <ActionsDropdown
        row={row}
        refetch={refetch}
        actions={[BroadcastTemplateUpdateButton, BroadcastTemplateDeleteButton]}
      />
    );
  } else {
    return null;
  }
};
