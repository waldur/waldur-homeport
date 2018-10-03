import * as React from 'react';

import { ResourceAnalysisItem } from './ResourceAnalysisItem';

import { Project } from './types';

interface ResourceAnalysisListProps {
  projects: Project[];
}

export const ResourceAnalysisList = (props: ResourceAnalysisListProps) => {
  const { projects } = props;
  const body = projects.map(project => (
    <li key={project.uuid}>
      <ResourceAnalysisItem project={project} />
    </li>
  ));

  if (!body.length) { return null; }

  return (
    <ul className="resource-analysis__list">{body}</ul>
  );
};
