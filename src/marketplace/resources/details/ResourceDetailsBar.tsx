import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { PageBarTab } from '@waldur/marketplace/context';
import { openModalDialog } from '@waldur/modal/actions';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';

const ProjectUsersList = lazyComponent(
  () => import('@waldur/project/team/ProjectUsersList'),
  'ProjectUsersList',
);

const tabs: PageBarTab[] = [
  {
    key: 'getting-started',
    title: translate('Getting started'),
  },
  {
    key: 'lexis-links',
    title: translate('LEXIS links'),
  },
  {
    key: 'robot-accounts',
    title: translate('Robot accounts'),
  },
  {
    key: 'usage-history',
    title: translate('Usage'),
  },
  {
    key: 'activity',
    title: translate('Activity'),
  },
  {
    key: 'tickets',
    title: translate('Tickets'),
  },
  {
    key: 'resource-options',
    title: translate('Options'),
  },
  {
    key: 'users',
    title: translate('Roles'),
  },
];

export const ResourceDetailsBar: FunctionComponent = () => {
  const dispatch = useDispatch();
  const openTeamModal = useCallback(() => {
    dispatch(openModalDialog(ProjectUsersList, { size: 'xl' }));
  }, [dispatch]);

  return (
    <PageBarTabs
      tabs={tabs}
      right={
        <ProjectUsersBadge
          compact
          max={3}
          className="col-auto align-items-center me-10"
          onClick={openTeamModal}
        />
      }
    />
  );
};
