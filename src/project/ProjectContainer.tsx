import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
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

  const { state } = useCurrentStateAndParams();
  const params = { uuid: project.uuid };

  return (
    <div className="container-fluid my-5">
      {canEdit && (
        <TabNav
          activeKey={state.name}
          listClassName="mb-4"
          items={[
            {
              key: 'project.dashboard',
              title: translate('View'),
              link: <Link state="project.dashboard" params={params} />,
              className: 'text-center min-w-60px',
            },
            {
              key: 'project-manage',
              title: translate('Edit'),
              link: <Link state="project-manage" params={params} />,
              className: 'text-center min-w-60px',
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
