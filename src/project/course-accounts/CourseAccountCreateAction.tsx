import { GraduationCapIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { hasManageCourseAccountPermission } from '@/customer/team/utils';
import { isFeatureVisible } from '@/features/connect';
import { InvitationsFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

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
