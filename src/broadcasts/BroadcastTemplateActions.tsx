import { useSelector } from 'react-redux';

import { BroadcastTemplateDeleteButton } from '@waldur/broadcasts/BroadcastTemplateDeleteButton';
import { BroadcastTemplateUpdateButton } from '@waldur/broadcasts/BroadcastTemplateUpdateButton';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export const BroadcastTemplateActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <>
        <BroadcastTemplateUpdateButton template={row} refetch={refetch} />
        <BroadcastTemplateDeleteButton template={row} refetch={refetch} />
      </>
    );
  } else {
    return null;
  }
};
