import { GraduationCapIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { hasManageCourseAccountPermission } from '@waldur/customer/team/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const CourseAccountFormDialog = lazyComponent(() =>
  import('./CourseAccountFormDialog').then((module) => ({
    default: module.CourseAccountFormDialog,
  })),
);

export const CourseAccountCreateButton: FC<{
  refetch(): void;
  project: Project;
}> = ({ project, refetch }) => {
  const canManageCourseAccount = useSelector(
    hasManageCourseAccountPermission(project),
  );
  const showCourseAccounts =
    isFeatureVisible(InvitationsFeatures.show_course_accounts) &&
    canManageCourseAccount &&
    project.kind === 'course';

  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(CourseAccountFormDialog, {
        resolve: { refetch },
      }),
    );

  if (!showCourseAccounts) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Course account')}
      action={callback}
      iconNode={<GraduationCapIcon weight="bold" />}
    />
  );
};
