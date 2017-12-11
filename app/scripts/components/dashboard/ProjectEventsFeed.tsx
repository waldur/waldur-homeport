import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { fetchEvents } from '@waldur/events/api';
import { $state } from '@waldur/core/services';
import { showEventTypes, showEventDetails } from '@waldur/events/actions';
import { TranslateProps } from '@waldur/i18n';
import { getCurrentProject } from '@waldur/store/currentProject';
import { connectTable, TableState } from '@waldur/table-react';

import { DashboardFeed } from './DashboardFeed';
import { Project } from './types';

type Props = TranslateProps & TableState & {
  project: Project;
  showTypes: () => void;
  showDetails: (event) => void;
  fetch: () => void;
};

class PureProjectEventsFeed extends React.PureComponent<Props> {
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
        title={props.translate('Events')}
        typesTitle={props.translate('Event types')}
        emptyText={props.translate('No events yet.')}
        listLink={$state.href('project.events', { uuid: props.project.uuid })}
        loading={props.loading}
        items={props.rows}
        showTypes={props.showTypes}
        showDetails={props.showDetails}
      />
    );
  }
}

const TableOptions = {
  table: 'projectEvents',
  fetchData: fetchEvents,
  getDefaultFilter: state => ({
    exclude_extra: true,
    scope: getCurrentProject(state).url
  }),
};

const mapDispatchToProps = dispatch => ({
  showTypes: () => dispatch(showEventTypes()),
  showDetails: event => dispatch(showEventDetails(event)),
});

const ProjectEventsFeed = compose(
  connectTable(TableOptions),
  connect(null, mapDispatchToProps),
)(PureProjectEventsFeed);

export {
  PureProjectEventsFeed,
  ProjectEventsFeed,
};
