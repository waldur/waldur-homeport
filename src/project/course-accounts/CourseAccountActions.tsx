import { FC } from 'react';
import { useSelector } from 'react-redux';
import { CourseAccount } from 'waldur-js-client';

import { hasManageCourseAccountPermission } from '@/customer/team/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { CourseAccountDeleteAction } from './CourseAccountDeleteAction';

export const CourseAccountActions: FC<{ row: CourseAccount; refetch }> = ({
  row,
  refetch,
}) => {
  const canManageCourseAccount = useSelector(
    hasManageCourseAccountPermission({ uuid: row.project_uuid }),
  );

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      disabled={!canManageCourseAccount}
      actions={[CourseAccountDeleteAction]}
      data-cy="course-account-actions-dropdown-btn"
    />
  );
};
