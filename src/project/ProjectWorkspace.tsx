import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { Layout } from '@waldur/navigation/Layout';
import { getProject } from '@waldur/workspace/selectors';

function getBreadcrumbs(project, state): BreadcrumbItem[] {
  if (project) {
    const items: BreadcrumbItem[] = [];
    if (state.name.includes('resources')) {
      items.push({
        label: translate('Resources'),
      });
    }
    return items;
  }
}

export const ProjectWorkspace: FunctionComponent = () => {
  const project = useSelector(getProject);
  const { state } = useCurrentStateAndParams();

  useBreadcrumbsFn(() => getBreadcrumbs(project, state), [project, state]);

  return <Layout />;
};
