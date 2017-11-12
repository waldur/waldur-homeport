import { dashboardChart as reducer, getChart } from './reducers';
import actions from './actions';

describe('Dashboard chart reducer', () => {
  it('should return default state', () => {
    const state = {'dashboardChart': reducer(undefined, {})};
    expect(getChart(state, 'customer')).toEqual({
      loading: false,
      erred: false,
      charts: []
    });
  });

  it('should handle start action', () => {
    expect(reducer(undefined, {
      type: actions.DASHBOARD_CHARTS_START,
      chartId: 'customer'
    })).toEqual({
      customer: {
        loading: true,
        erred: false,
        charts: []
      }
    });
  });

  it('should handle success action', () => {
    expect(reducer(undefined, {
      type: actions.DASHBOARD_CHARTS_SUCCESS,
      chartId: 'customer',
      charts: [
        {
          label: 'Today',
          value: 100,
        }
      ]
    })).toEqual({
      customer: {
        loading: false,
        erred: false,
        charts: [
          {
            label: 'Today',
            value: 100,
          }
        ]
      }
    });
  });
});
