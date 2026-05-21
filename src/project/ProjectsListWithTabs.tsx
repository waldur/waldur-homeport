import { useMemo, useState } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';
import { useCustomer } from '@/workspace/hooks';

import { MetadataGroupBy } from './metadata/MetadataGroupBy';

const ProjectsList = lazyComponent(() =>
  import('./ProjectsList').then((module) => ({
    default: module.ProjectsList,
  })),
);

const MetadataByAnswer = lazyComponent(() =>
  import('./metadata/ProjectsMetadataByAnswer').then((module) => ({
    default: module.ProjectsMetadataByAnswer,
  })),
);

const MetadataByProject = lazyComponent(() =>
  import('./metadata/ProjectsMetadataByProject').then((module) => ({
    default: module.ProjectsMetadataByProject,
  })),
);

export const ProjectsListWithTabs = () => {
  const currentCustomer = useCustomer();
  const [metadataGroupBy, setMetadataGroupBy] = useState('answer');

  const tabs = useMemo(() => {
    const tabs = [
      {
        key: 'general',
        title: translate('General'),
        component: ProjectsList,
      },
    ];
    if (metadataGroupBy === 'answer') {
      tabs.push({
        key: 'metadata',
        title: translate('Metadata'),
        component: MetadataByAnswer,
      });
    } else if (metadataGroupBy === 'project') {
      tabs.push({
        key: 'metadata',
        title: translate('Metadata'),
        component: MetadataByProject,
      });
    }
    return tabs;
  }, [metadataGroupBy]);

  if (currentCustomer.project_metadata_checklist) {
    return (
      <TableWithTabs
        title={translate('Projects')}
        tabs={tabs}
        data={{
          hasActionBar: false,
          cardBordered: false,
          fullWidth: true,
        }}
        actions={[
          {
            component: (
              <MetadataGroupBy
                value={metadataGroupBy}
                onChange={setMetadataGroupBy}
                buttons={[
                  { value: 'answer', label: translate('Answer') },
                  { value: 'project', label: translate('Project') },
                ]}
              />
            ),
            activeKeys: ['metadata'],
          },
        ]}
      />
    );
  }
  return <ProjectsList />;
};
