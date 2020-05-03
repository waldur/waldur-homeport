import { useRouter } from '@uirouter/react';
import * as React from 'react';

import { ENV, ngInjector } from '@waldur/core/services';

import { WOKSPACE_NAMES } from '../workspace/constants';

export const BrandName = () => {
  const router = useRouter();
  const onLogoClick = event => {
    const WorkspaceService = ngInjector.get('WorkspaceService');
    const workspaceData = WorkspaceService.getWorkspace();
    const { workspace } = workspaceData;
    event.preventDefault();
    switch (workspace) {
      case WOKSPACE_NAMES.organization:
        router.stateService.go(
          'organization.dashboard',
          { uuid: workspaceData.customer.uuid },
          { reload: true },
        );
        break;
      case WOKSPACE_NAMES.support:
        router.stateService.go('support.dashboard', { reload: true });
        break;
      case WOKSPACE_NAMES.project:
        router.stateService.go(
          'project.details',
          { uuid: workspaceData.project.uuid },
          { reload: true },
        );
        break;
      case WOKSPACE_NAMES.user:
        router.stateService.go('profile.details', { reload: true });
        break;
      default:
        router.stateService.go('profile.details', { reload: true });
        break;
    }
  };
  return (
    <li className="brand-name hidden-xs">
      <a onClick={onLogoClick}>
        {ENV.sidebarLogo ? (
          <img src={ENV.sidebarLogo} style={{ maxHeight: 60, maxWidth: 175 }} />
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
