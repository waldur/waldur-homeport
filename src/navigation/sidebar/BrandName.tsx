import * as React from 'react';

import { ENV, ngInjector, $state } from '@waldur/core/services';

import { WOKSPACE_NAMES } from '../workspace/constants';

export const BrandName = () => {
  const onLogoClick = event => {
    const WorkspaceService = ngInjector.get('WorkspaceService');
    const workspaceData = WorkspaceService.getWorkspace();
    const { workspace } = workspaceData;
    event.preventDefault();
    switch (workspace) {
      case WOKSPACE_NAMES.organization:
        $state.go(
          'organization.dashboard',
          { uuid: workspaceData.customer.uuid },
          { reload: true },
        );
        break;
      case WOKSPACE_NAMES.support:
        $state.go('support.dashboard', { reload: true });
        break;
      case WOKSPACE_NAMES.project:
        $state.go(
          'project.details',
          { uuid: workspaceData.project.uuid },
          { reload: true },
        );
        break;
      case WOKSPACE_NAMES.user:
        $state.go('profile.details', { reload: true });
        break;
      default:
        $state.go('profile.details', { reload: true });
        break;
    }
  };
  return (
    <li className="brand-name hidden-xs">
      <a onClick={onLogoClick}>
        {ENV.sidebarLogo ? (
          <img src={ENV.sidebarLogo} style={{ maxHeight: 60, maxWidth: 200 }} />
        ) : (
          <>
            <i className="fa fa-th-large"></i>{' '}
            <span className="ellipsis">{ENV.shortPageTitle}</span>
          </>
        )}
      </a>
    </li>
  );
};
