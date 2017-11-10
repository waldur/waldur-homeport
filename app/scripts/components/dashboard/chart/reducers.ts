import { combineReducers } from 'redux';

import { createByKey } from '@waldur/store/utils';
import actions from './actions';
import { ChartsState } from './types';

const INITIAL_STATE: ChartsState = {
  loading: false,
  erred: false,
  charts: [],
};

function reducer(state=INITIAL_STATE, action): ChartsState {
  switch (action.type) {
  case actions.DASHBOARD_CHARTS_START:
    return {
      ...state,
      loading: true
    };

  case actions.DASHBOARD_CHARTS_SUCCESS:
    return {
      ...state,
      loading: false,
      erred: false,
      charts: action.charts
    };

  case actions.DASHBOARD_CHARTS_ERROR:
    return {
      ...state,
      loading: false,
      erred: true
    };

  default:
    return state;
  }
}

export const dashboardChart = createByKey(
  action => action && action.hasOwnProperty('chartId'),
  action => action.chartId
)(reducer);

export const getChart = (state: any, chartId: string): ChartsState => {
  if (state.dashboardChart.hasOwnProperty(chartId)) {
    return state.dashboardChart[chartId];
  } else {
    return INITIAL_STATE;
  }
};
