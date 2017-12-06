import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { Dispatch, compose } from 'redux';

import { withStore } from '@waldur/core/reactHelper';
import { $state } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getTableState } from '@waldur/table-react/store';

import * as actions from './actions';
import { DashboardFeed } from './DashboardFeed';
import { Project, FeedItem, TABLE_ID_DASHBOARD_EVENTS } from './types';

type Props = TranslateProps & {
  project: Project;
  loading: boolean;
  erred: boolean;
  dataList: FeedItem[];
  showTypes: () => void;
  showDetails: (event) => void;
  onFetch: () => void;
};

class PureProjectEventsFeed extends React.PureComponent<Props> {
  componentWillMount() {
    this.props.onFetch();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.project !== nextProps.project) {
      this.props.onFetch();
    }
  }

  render() {
    const { props } = this;
    return (
      <DashboardFeed
        translate={props.translate}
        title={props.translate('Events')}
        buttonTitle={props.translate('Event types')}
        emptyText={props.translate('No events yet.')}
        showAllUrl={$state.href('project.events', { uuid: props.project.uuid })}
        loading={props.loading}
        items={props.dataList}
        showTypes={props.showTypes}
        showDetails={props.showDetails}
      />
    );
  }
}

const mapStateToProps = (state) => {
  const eventsState = getTableState(TABLE_ID_DASHBOARD_EVENTS)(state);
  return {
    loading: eventsState.loading,
    erred: !!eventsState.error,
    dataList: eventsState.rows,
  };
}

const mapDispatchToProps = (dispatch: Dispatch<{}>, ownProps: Props) => ({
  showTypes: () => dispatch(openModalDialog('eventTypesDialog')),
  showDetails: (event) => dispatch(openModalDialog('eventDetailsDialog', { resolve: { event } })),
  onFetch: () => dispatch(actions.fetchEventsFeed(ownProps.project)),
});

const ProjectEventsFeed = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
)(PureProjectEventsFeed);

export {
  PureProjectEventsFeed,
  ProjectEventsFeed,
};
