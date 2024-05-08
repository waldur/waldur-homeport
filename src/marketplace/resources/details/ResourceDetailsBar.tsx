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
    priority: 10,
  },
  {
    key: 'lexis-links',
    title: translate('LEXIS links'),
    priority: 20,
  },
  {
    key: 'robot-accounts',
    title: translate('Robot accounts'),
    priority: 30,
  },
  {
    key: 'usage-history',
    title: translate('Usage'),
    priority: 40,
  },
  {
    key: 'tickets',
    title: translate('Tickets'),
    priority: 50,
  },
  {
    key: 'resource-options',
    title: translate('Options'),
    priority: 60,
  },
  {
    key: 'users',
    title: translate('Roles'),
    priority: 70,
  },
  {
    key: 'metadata',
    title: translate('Resource metadata'),
    children: [
      { key: 'resource-details', title: translate('Resource details') },
      { key: 'activity', title: translate('Audit logs') },
      { key: 'order-history', title: translate('Order history') },
    ],
    priority: 80,
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
      showFirstTab
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
