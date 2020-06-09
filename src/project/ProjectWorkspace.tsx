import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Layout } from '@waldur/navigation/Layout';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectSidebar } from './ProjectSidebar';

function refreshBreadcrumbs(currentProject, state) {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  if (currentProject) {
    const items: any[] = [
      {
        label: translate('Project workspace'),
        state: 'project.details',
        params: {
          uuid: currentProject.uuid,
        },
      },
    ];
    if (state.name.includes('resources')) {
      items.push({
        label: translate('Resources'),
      });
    }
    BreadcrumbsService.items = items;
  }
}

export const ProjectWorkspace = () => {
  const [pageClass, setPageClass] = React.useState<string>();
  const [hideBreadcrumbs, setHideBreadcrumbs] = React.useState<boolean>();
  const project = useSelector(getProject);
  const { state, params } = useCurrentStateAndParams();

  function refreshState() {
    const data = state?.data;
    setPageClass(data?.pageClass);
    setHideBreadcrumbs(data?.hideBreadcrumbs);
    refreshBreadcrumbs(project, state);
  }

  React.useEffect(refreshState, [state, params]);

  return (
    <Layout
      sidebar={<ProjectSidebar />}
      pageClass={pageClass}
      hideBreadcrumbs={hideBreadcrumbs}
    />
  );
};
