import { UIView } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { getProject } from '@waldur/workspace/selectors';

const ProjectGeneral = lazyComponent(() =>
  import('./manage/ProjectGeneral').then((module) => ({
    default: module.ProjectGeneral,
  })),
);
const ProjectMetadata = lazyComponent(() =>
  import('./manage/ProjectMetadata').then((module) => ({
    default: module.ProjectMetadata,
  })),
);
const ProjectMembershipRestrictions = lazyComponent(() =>
  import('./manage/ProjectMembershipRestrictions').then((module) => ({
    default: module.ProjectMembershipRestrictions,
  })),
);
const ProjectCredit = lazyComponent(() =>
  import('./manage/ProjectCredit').then((module) => ({
    default: module.ProjectCredit,
  })),
);
const ProjectDelete = lazyComponent(() =>
  import('./manage/ProjectDelete').then((module) => ({
    default: module.ProjectDelete,
  })),
);
const ProjectEndDateChangeRequests = lazyComponent(() =>
  import('./manage/ProjectEndDateChangeRequests').then((module) => ({
    default: module.ProjectEndDateChangeRequests,
  })),
);

export const ProjectManageContainer = () => {
  const project = useSelector(getProject);

  const tabs = useMemo<PageBarTab[]>(
    () =>
      [
        {
          key: 'general',
          component: ProjectGeneral,
          title: translate('General'),
        },
        {
          key: 'metadata',
          component: ProjectMetadata,
          title: translate('Metadata'),
        },
        {
          key: 'membership-restrictions',
          component: ProjectMembershipRestrictions,
          title: translate('Membership restrictions'),
        },
        (project.project_credit || project.project_credit === 0) && {
          key: 'credit',
          component: ProjectCredit,
          title: translate('Credit management'),
        },
        !project?.is_removed && {
          key: 'end-date-change-requests',
          component: ProjectEndDateChangeRequests,
          title: translate('End date change requests'),
        },
        !project?.is_removed && {
          key: 'remove',
          component: ProjectDelete,
          title: translate('Remove'),
        },
      ].filter(Boolean),
    [project],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component key={key} {...props} tabSpec={tabSpec} />
      )}
    />
  );
};
