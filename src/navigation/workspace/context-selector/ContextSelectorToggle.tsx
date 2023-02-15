import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { formatRole } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { formatUserStatus } from '@waldur/user/support/utils';
import {
  getCustomer,
  getProject,
  getUser,
  getWorkspace,
} from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
} from '@waldur/workspace/types';

import { ContextSelectorDropdown } from './ContextSelectorDropdown';
import { GuestDropdown } from './GuestDropdown';
import { getItemAbbreviation } from './utils';

export const ContextSelectorToggle: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const isOwner = customer?.owners?.find((perm) => perm.uuid === user?.uuid);
  const isServiceManager = customer?.service_managers?.find(
    (perm) => perm.uuid === user.uuid,
  );
  const projectUser = project?.permissions?.find(
    (perm) => perm.user_uuid === user?.uuid,
  );
  const image = project?.image || customer?.image;
  const workspace = useSelector(getWorkspace);
  const isProject = workspace === PROJECT_WORKSPACE;
  const isCustomer = workspace === ORGANIZATION_WORKSPACE;
  const abbreviation = useMemo(() => {
    if (isProject && project) {
      return getItemAbbreviation(project);
    }
    if (isCustomer && customer) {
      return getItemAbbreviation(customer);
    }
    if (project) {
      return getItemAbbreviation(project);
    }
    if (customer) {
      return getItemAbbreviation(customer);
    }
    return '';
  }, [customer, project, isProject, isCustomer]);
  return (
    <div
      className="aside-toolbar flex-column-auto overflow-hidden"
      id="kt_aside_toolbar"
    >
      <div
        className="d-flex align-items-center justify-content-center py-5 context-selector-toggle"
        data-kt-menu-trigger="click"
        data-kt-menu-attach=".aside-toolbar"
        data-kt-menu-placement="right-start"
        data-kt-menu-flip="bottom"
      >
        <div className="symbol symbol-50px">
          {image ? (
            <Image src={image} size={50} />
          ) : (
            <ImagePlaceholder width="50px" height="50px">
              {abbreviation && (
                <div className="symbol-label fs-6 fw-bold">{abbreviation}</div>
              )}
            </ImagePlaceholder>
          )}
        </div>
        <div className="flex-row-fluid flex-wrap ms-5">
          <div className="d-flex">
            <div className="flex-grow-1 me-2 ellipsis">
              {user ? (
                <span
                  className={classNames(
                    { 'text-white': isProject, 'text-gray-600': !isProject },
                    'fs-6 fw-bold text-nowrap',
                  )}
                >
                  {project ? project.name : translate('Select project')}
                </span>
              ) : (
                <span className="text-gray-600 fs-6 fw-bold">
                  {translate('Guest')}
                </span>
              )}
              {user ? (
                <span
                  className={classNames(
                    { 'text-white': isCustomer, 'text-gray-600': !isCustomer },
                    'fw-semibold d-block fs-7 mb-1',
                  )}
                >
                  {customer
                    ? customer.abbreviation
                      ? customer.abbreviation
                      : customer.display_name
                    : translate('Select organization')}
                </span>
              ) : (
                <span className="text-gray-600 d-block fs-7 fw-semibold">
                  {translate('Guest')}
                </span>
              )}
              {user && (
                <div className="d-flex align-items-center text-success fs-8">
                  {projectUser
                    ? formatRole(projectUser.role)
                    : isOwner
                    ? translate(ENV.roles.owner)
                    : isServiceManager
                    ? translate(ENV.roles.service_manager)
                    : formatUserStatus(user)}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center">
              <i className="fa fa-angle-right display-5 fw-light"></i>
            </div>
          </div>
        </div>
      </div>
      {user ? <ContextSelectorDropdown /> : <GuestDropdown />}
    </div>
  );
};
