import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { ProjectChart } from './chart/ProjectChart';
import { ProjectEventsFeed } from './ProjectEventsFeed';
import { Project } from './types';

interface ProjectDashboardProps {
  project: Project;
}

const ProjectDashboard: React.SFC<ProjectDashboardProps> = ({ project }) => (
  <div className="wrapper wrapper-content m-l-n">
    <ProjectChart project={project} />
    <div className="row">
      <div className="col-md-6">
        <ProjectEventsFeed project={project}/>
      </div>
    </div>
  </div>
);

export default connectAngularComponent(ProjectDashboard, ['project']);
