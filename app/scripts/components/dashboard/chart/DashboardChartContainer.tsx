import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import actions from './actions';
import { getChart } from './reducers';
import { Scope } from './types';
import DashboardChartList from './DashboardChartList';

type Props = {
  scope: Scope,
  signal: string,
  chartId: string,
};

const mapStateToProps = (state, ownProps: Props) => getChart(state, ownProps.chartId);

const mapDispatchToProps = (dispatch: Dispatch<{}>, ownProps: Props) => ({
  onStart: () => {
    dispatch(actions.dashboardChartStart(ownProps.chartId, ownProps.scope));
    dispatch(actions.emitSignal(ownProps.signal));
  },
  onStop: () => {
    dispatch(actions.dashboardChartStop(ownProps.chartId))
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardChartList);
