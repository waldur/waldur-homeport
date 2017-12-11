import * as React from 'react';

import { withFeature, FeatureProps } from '@waldur/features/connect';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProjectChart } from './chart/ProjectChart';
import { ProjectAlertsFeed } from './ProjectAlertsFeed';
import { ProjectEventsFeed } from './ProjectEventsFeed';
import { Project } from './types';

type Props = FeatureProps & {
  project: Project;
};

const PureProjectDashboard = ({ isVisible, project }: Props) => (
  <div className="wrapper wrapper-content">
    <ProjectChart project={project} />
    <div className="row">
      <div className="col-md-6">
        <ProjectEventsFeed project={project} />
      </div>
      {isVisible('alerts') && (
        <div className="col-md-6">
          <ProjectAlertsFeed project={project} />
        </div>
      )}
    </div>
  </div>
);

const ProjectDashboard = withFeature(PureProjectDashboard);

export {
  PureProjectDashboard,
  ProjectDashboard,
};

export default connectAngularComponent(ProjectDashboard, ['project']);
