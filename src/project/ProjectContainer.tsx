import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectBreadcrumbPopover } from './ProjectBreadcrumbPopover';
import { ProjectProfile } from './ProjectProfile';
import { canEditProject } from './utils';

const PageHero = ({ project }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const canEdit = canEditProject(user, { customer, project });

  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const goTo = (stateName) =>
    router.stateService.go(stateName, { uuid: project.uuid });

  return (
    <div className="container-fluid my-5">
      {canEdit && (
        <Tab.Container defaultActiveKey={state.name} onSelect={goTo}>
          <Nav variant="tabs" className="nav-line-tabs mb-4">
            <Nav.Item>
              <Nav.Link
                eventKey="project.dashboard"
                className="text-center min-w-60px"
              >
                {translate('View')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="project-manage"
                className="text-center min-w-60px"
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

  const { getOrganizationBreadcrumbItem } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      getOrganizationBreadcrumbItem(
        { uuid: project.customer_uuid, name: project.customer_name },
        { ellipsis: 'md' },
      ),
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
