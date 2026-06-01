import { FC } from 'react';
import { CourseAccount } from 'waldur-js-client';

import { checkHasManageCourseAccountPermission } from '@/customer/team/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { CourseAccountDeleteAction } from './CourseAccountDeleteAction';

export const CourseAccountActions: FC<{ row: CourseAccount; refetch }> = ({
  row,
  refetch,
}) => {
  const user = useUser();
  const canManageCourseAccount = checkHasManageCourseAccountPermission(user, {
    uuid: row.project_uuid,
  });

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      disabled={!canManageCourseAccount}
      actions={[CourseAccountDeleteAction]}
    />
  );
};
