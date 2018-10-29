import { connect } from 'react-redux';

import { emitSignal } from '@waldur/store/coreSaga';

import actions from './actions';
import DashboardChartList from './DashboardChartList';
import { getChart } from './reducers';
import { Scope, ChartsState } from './types';

interface OwnProps {
  scope: Scope;
  signal: string;
  chartId: string;
}

interface DispatchProps {
  onStart(): void;
  onStop(): void;
}

const mapStateToProps = (state, ownProps: OwnProps) => getChart(state, ownProps.chartId);

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  onStart: () => {
    dispatch(actions.dashboardChartStart(ownProps.chartId, ownProps.scope));
    dispatch(emitSignal(ownProps.signal));
  },
  onStop: () => {
    dispatch(actions.dashboardChartStop(ownProps.chartId));
  },
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
});

type MergedProps = ChartsState & DispatchProps;

const connector = connect<ChartsState, DispatchProps, OwnProps, MergedProps>(
  mapStateToProps, mapDispatchToProps, mergeProps);

export default connector(DashboardChartList);
