import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { useMemo } from 'react';

import { IBreadcrumbItem, TabNav, useBreadcrumbs } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { LayoutSlot } from '@/navigation/slots';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { ProjectBreadcrumbPopover } from './ProjectBreadcrumbPopover';
import { ProjectProfile } from './ProjectProfile';
import { canEditProject } from './utils';

// The preset crumbs link whenever the caller may visit some organization.
// This trail follows the organization loaded with the project. When that
// fetch returned nothing, the names stay text: the project still carries them.
const UNREAD_ORGANIZATION_CRUMB = {
  to: undefined,
  params: undefined,
  onClick: undefined,
};

const PageHero = ({ project }) => {
  const user = useUser();
  const customer = useCustomer();

  const canEdit = canEditProject(user, { customer, project });

  const { state } = useCurrentStateAndParams();
  const params = { uuid: project.uuid };

  return (
    <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'my-[1.25rem]')}>
      {canEdit && (
        <TabNav
          aria-label={translate('Project views')}
          // Every project page but Edit is one of View's tabs.
          activeKey={
            state.name === 'project-manage'
              ? 'project-manage'
              : 'project.dashboard'
          }
          listClassName="mb-3"
          items={[
            {
              key: 'project.dashboard',
              title: translate('View'),
              link: <Link state="project.dashboard" params={params} />,
              className: 'text-center min-w-[60px]',
            },
            {
              key: 'project-manage',
              title: translate('Edit'),
              link: <Link state="project-manage" params={params} />,
              className: 'text-center min-w-[60px]',
            },
          ]}
        />
      )}
      <ProjectProfile project={project} />
    </div>
  );
};

const ProjectContainerWithHero = (props) => {
  const project = useProject();
  const customer = useCustomer();

  const {
    getOrganizationsBreadcrumbItem,
    getOrganizationBreadcrumbItem,
    getOrganizationProjectsBreadcrumbItem,
  } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    const organizationCrumb = customer ? undefined : UNREAD_ORGANIZATION_CRUMB;
    return [
      getOrganizationsBreadcrumbItem(organizationCrumb),
      getOrganizationBreadcrumbItem(
        {
          uuid: project.customer_uuid,
          name: project.customer_name,
        },
        organizationCrumb,
      ),
      getOrganizationProjectsBreadcrumbItem(
        project.customer_uuid,
        organizationCrumb,
      ),
      {
        key: 'project',
        text: project.name,
        dropdown: (close) => (
          <ProjectBreadcrumbPopover project={project} close={close} />
        ),

        truncate: true,
        active: true,
      },
    ];
  }, [project, customer]);
  useBreadcrumbs(breadcrumbItems);

  return (
    <>
      <LayoutSlot name="hero">
        <PageHero project={project} />
      </LayoutSlot>
      <UIView {...props} />
    </>
  );
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
