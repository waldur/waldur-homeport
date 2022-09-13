import classNames from 'classnames';
import { FunctionComponent } from 'react';
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

import { QuickProjectSelectorDropdown } from './QuickProjectSelectorDropdown';

export const QuickProjectSelectorToggle: FunctionComponent = () => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const isOwner = customer?.owners?.find((perm) => perm.uuid === user.uuid);
  const isServiceManager = customer?.service_managers?.find(
    (perm) => perm.uuid === user.uuid,
  );
  const projectUser = project?.permissions?.find(
    (perm) => perm.user_uuid === user.uuid,
  );
  const image = project?.image || customer?.image;
  const workspace = useSelector(getWorkspace);
  const isProject = workspace === PROJECT_WORKSPACE;
  const isCustomer = workspace === ORGANIZATION_WORKSPACE;
  return (
    <div
      className="aside-toolbar flex-column-auto overflow-hidden"
      id="kt_aside_toolbar"
    >
      <div
        className="d-flex align-items-sm-center justify-content-center py-5 quick-project-selector-toggle"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="right-start"
        data-kt-menu-flip="bottom"
      >
        <div className="symbol symbol-50px">
          {image ? (
            <Image src={image} size={50} />
          ) : (
            <ImagePlaceholder width="50px" height="50px" />
          )}
        </div>
        <div className="flex-row-fluid flex-wrap ms-5">
          <div className="d-flex">
            <div
              className="flex-grow-1 me-2"
              style={{
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                className={classNames(
                  { 'text-white': isProject, 'text-gray-600': !isProject },
                  'fs-6 fw-bold',
                )}
              >
                {project ? project.name : translate('Select project')}
              </span>
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
              <div className="d-flex align-items-center text-success fs-8">
                {projectUser
                  ? formatRole(projectUser.role)
                  : isOwner
                  ? translate(ENV.roles.owner)
                  : isServiceManager
                  ? translate(ENV.roles.service_manager)
                  : formatUserStatus(user)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <QuickProjectSelectorDropdown />
    </div>
  );
};
