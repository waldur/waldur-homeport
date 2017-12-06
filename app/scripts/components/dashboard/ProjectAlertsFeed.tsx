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
import { Project, FeedItem, TABLE_ID_DASHBOARD_ALERTS } from './types';

type Props = TranslateProps & {
  project: Project;
  loading: boolean;
  erred: boolean;
  dataList: FeedItem[];
  showTypes: () => void;
  onFetch: () => void;
};

class PureProjectAlertsFeed extends React.PureComponent<Props> {
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
        title={props.translate('Alerts')}
        buttonTitle={props.translate('Alert types')}
        emptyText={props.translate('No alerts yet.')}
        showAllUrl={$state.href('project.alerts', { uuid: props.project.uuid })}
        loading={props.loading}
        items={props.dataList}
        showTypes={props.showTypes}
      />
    );
  }
}

const mapStateToProps = (state) => {
  const alertsState = getTableState(TABLE_ID_DASHBOARD_ALERTS)(state);
  return {
    loading: alertsState.loading,
    erred: !!alertsState.error,
    dataList: alertsState.rows,
  };
}

const mapDispatchToProps = (dispatch: Dispatch<{}>, ownProps: Props) => ({
  showTypes: () => dispatch(openModalDialog('alertTypesDialog')),
  onFetch: () => dispatch(actions.fetchAlertsFeed(ownProps.project)),
});

const ProjectAlertsFeed = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
)(PureProjectAlertsFeed);

export {
  PureProjectAlertsFeed,
  ProjectAlertsFeed,
};
