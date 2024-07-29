import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectBreadcrumbPopover } from './ProjectBreadcrumbPopover';
import { ProjectProfile } from './ProjectProfile';

const PageHero = ({ project }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const canEdit =
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    });

  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const goTo = (stateName) =>
    router.stateService.go(stateName, { uuid: project.uuid });

  return (
    <div className="container-fluid mb-8 mt-6">
      {canEdit && (
        <Tab.Container defaultActiveKey={state.name} onSelect={goTo}>
          <Nav variant="tabs" className="nav-line-tabs mb-4">
            <Nav.Item>
              <Nav.Link
                eventKey="project.dashboard"
                className="text-center w-60px"
              >
                {translate('View')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="project-manage"
                className="text-center w-60px"
              >
                {translate('Edit')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Tab.Container>
      )}
      <ProjectProfile project={project} />
    </div>
  );
};

const ProjectContainerWithHero = (props) => {
  const project = useSelector(getProject);

  usePageHero(<PageHero project={project} />, [project]);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      {
        key: 'organization.dashboard',
        text: project.customer_name,
        to: 'organization.dashboard',
        params: { uuid: project.customer_uuid },
        ellipsis: 'md',
        maxLength: 11,
      },
      {
        key: 'organization.projects',
        text: translate('Projects'),
        to: 'organization.projects',
        params: { uuid: project.customer_uuid },
        ellipsis: 'xl',
      },
      {
        key: 'project',
        text: project.name,
        dropdown: (close) => (
          <ProjectBreadcrumbPopover project={project} close={close} />
        ),
        truncate: true,
        active: true,
      },
    ],
    [project],
  );
  useBreadcrumbs(breadcrumbItems);

  return <UIView {...props} />;
};

export const ProjectContainer = (props) => {
  const { state } = useCurrentStateAndParams();
  const project = useSelector(getProject);

  if (!project) {
    return null;
  }

  if (state.data?.skipHero) {
    return <UIView {...props} />;
  }
  return <ProjectContainerWithHero {...props} />;
};
