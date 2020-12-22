import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import {
  getWorkspace,
  getCustomer,
  getProject,
} from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  SUPPORT_WORKSPACE,
  PROJECT_WORKSPACE,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

export const BrandName: FunctionComponent = () => {
  const router = useRouter();
  const workspace = useSelector(getWorkspace);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const onLogoClick = (event) => {
    event.preventDefault();
    switch (workspace) {
      case ORGANIZATION_WORKSPACE:
        router.stateService.go(
          'organization.dashboard',
          { uuid: customer.uuid },
          { reload: true },
        );
        break;
      case SUPPORT_WORKSPACE:
        router.stateService.go('support.dashboard', { reload: true });
        break;
      case PROJECT_WORKSPACE:
        router.stateService.go(
          'project.details',
          { uuid: project.uuid },
          { reload: true },
        );
        break;
      case USER_WORKSPACE:
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
