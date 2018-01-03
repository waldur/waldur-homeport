import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { showAlertTypes } from '@waldur/alerts/actions';
import { fetchAlerts } from '@waldur/alerts/api';
import { $state } from '@waldur/core/services';
import { TranslateProps } from '@waldur/i18n';
import { getCurrentProject } from '@waldur/store/currentProject';
import { connectTable, TableState } from '@waldur/table-react';

import { DashboardFeed } from './DashboardFeed';
import { Project } from './types';

interface Props extends TranslateProps, TableState {
  project: Project;
  showTypes: () => void;
  fetch: () => void;
}

class PureProjectAlertsFeed extends React.PureComponent<Props> {
  componentWillMount() {
    this.props.fetch();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.project !== nextProps.project) {
      this.props.fetch();
    }
  }

  render() {
    const { props } = this;
    return (
      <DashboardFeed
        translate={props.translate}
        title={props.translate('Alerts')}
        typesTitle={props.translate('Alert types')}
        emptyText={props.translate('No alerts yet.')}
        listLink={$state.href('project.alerts', { uuid: props.project.uuid })}
        loading={props.loading}
        items={props.rows}
        showTypes={props.showTypes}
      />
    );
  }
}

const TableOptions = {
  table: 'projectAlerts',
  fetchData: fetchAlerts,
  getDefaultFilter: state => ({
    aggregate: 'project',
    uuid: getCurrentProject(state).uuid,
    opened: true,
    o: '-created',
  }),
};

const mapDispatchToProps = dispatch => ({
  showTypes: () => dispatch(showAlertTypes()),
});

const ProjectAlertsFeed: any = compose(
  connect(null, mapDispatchToProps),
  connectTable(TableOptions),
)(PureProjectAlertsFeed);

export {
  PureProjectAlertsFeed,
  ProjectAlertsFeed,
};
