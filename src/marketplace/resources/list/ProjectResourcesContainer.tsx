import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectResourcesFilter } from './ProjectResourcesFilter';
import { ProjectResourcesList } from './ProjectResourcesList';
import { loadData } from './utils';

export const ProjectResourcesContainer: React.FC = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();

  const project = useSelector(getProject);

  const { loading, value, error } = useAsync(
    () => loadData(category_uuid, project.uuid),
    [category_uuid],
  );

  useTitle(
    value
      ? translate('{category} resources', { category: value.title })
      : translate('Project resources'),
  );

  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load category details')}</>;
  } else {
    return (
      <ProjectResourcesList
        columns={value.columns}
        category_uuid={category_uuid}
        filters={<ProjectResourcesFilter offerings={value.offerings} />}
      />
    );
  }
};
