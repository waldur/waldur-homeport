import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { Dispatch, compose } from 'redux';

import { $state } from '@waldur/core/services';
import { withVisible, connectAngularComponent, IfVisibleProps } from '@waldur/core/reactHelper';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getTableState } from '@waldur/table-react/store';

import { ProjectChart } from './chart/ProjectChart';
import { DashboardFeed } from './DashboardFeed';
import { ProjectAlertsFeed } from './ProjectAlertsFeed';
import { ProjectEventsFeed } from './ProjectEventsFeed';
import { Project } from './types';

type Props = TranslateProps & IfVisibleProps & {
  project: Project;
};

const PureProjectDashboard = (props: Props) => {
  return (
    <div className="wrapper wrapper-content">
      <ProjectChart project={props.project} />
      <div className="row">
        <div className="col-md-6">
          <ProjectEventsFeed project={props.project} />
        </div>
        {props.isVisible('alerts') && (
          <div className="col-md-6">
            <ProjectAlertsFeed project={props.project} />
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectDashboard = compose(
  withTranslation,
  withVisible,
)(PureProjectDashboard);

export {
  PureProjectDashboard,
  ProjectDashboard,
};

export default connectAngularComponent(ProjectDashboard, ['project']);
