import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { translate } from '@/i18n';
import { useBreadcrumbs, usePageHero } from '@/navigation/context';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';
import { IBreadcrumbItem } from '@/navigation/types';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { ProjectBreadcrumbPopover } from './ProjectBreadcrumbPopover';
import { ProjectProfile } from './ProjectProfile';
import { canEditProject } from './utils';

const PageHero = ({ project }) => {
  const user = useUser();
  const customer = useCustomer();

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
  const project = useProject();

  usePageHero(<PageHero project={project} />, [project]);

  const {
    getOrganizationsBreadcrumbItem,
    getOrganizationBreadcrumbItem,
    getOrganizationProjectsBreadcrumbItem,
  } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      getOrganizationsBreadcrumbItem(),
      getOrganizationBreadcrumbItem(
        { uuid: project.customer_uuid, name: project.customer_name },
        { ellipsis: 'md' },
      ),
      getOrganizationProjectsBreadcrumbItem(project.customer_uuid),
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
  const project = useProject();

  if (!project) {
    return null;
  }

  if (state.data?.skipHero) {
    return <UIView {...props} />;
  }
  return <ProjectContainerWithHero {...props} />;
};
