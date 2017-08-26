import reducer, {getChart} from './reducers';

describe('Dashboard chart reducer', () => {
  it('should return inital state', () => {
    expect(reducer(undefined, {})).toEqual({
      dashboardChart: {}
    });
  });

  it('should return default state', () => {
    const state = reducer(undefined, {});
    expect(getChart(state, 'customer')).toEqual({
      loading: false,
      erred: false,
      charts: []
    });
  });

  it('should handle start action', () => {
    expect(reducer(undefined, {
      type: 'DASHBOARD_CHARTS_START',
      chartId: 'customer'
    })).toEqual({
      dashboardChart: {
        customer: {
          loading: true,
          erred: false,
          charts: []
        }
      }
    });
  });

  it('should handle success action', () => {
    expect(reducer(undefined, {
      type: 'DASHBOARD_CHARTS_SUCCESS',
      chartId: 'customer',
      charts: [
        {
          label: 'Today',
          value: 100,
        }
      ]
    })).toEqual({
      dashboardChart: {
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
      }
    });
  });

});
