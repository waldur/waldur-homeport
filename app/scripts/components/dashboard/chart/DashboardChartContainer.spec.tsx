import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import actions from './actions';
import DashboardChartList from './DashboardChartList';
import DashboardChartContainer from './DashboardChartContainer';

describe('DashboardChartContainer', () => {
  const mockStore = configureStore();
  const chart = {
    title: 'Applications',
    current: 100,
    change: 10,
    data: [],
  };

  const initialState = {
    dashboardChart: {
      customer: {
        loading: false,
        charts: [chart]
      }
    }
  };
  const customer = null;
  let store, container;

  beforeEach(() => {
    store = mockStore(initialState);
    container = mount(
      <Provider store={store}>
        <DashboardChartContainer
          scope={customer}
          signal='organizationDashboard.initialized'
          chartId='customer'/>
      </Provider>
    );
  });

  it('renders component with valid properties', () => {
    expect(container.find(DashboardChartList).prop('loading')).toBe(false);
    expect(container.find(DashboardChartList).prop('charts')).toEqual([chart]);
  });

  it('emits valid actions', () => {
    const currentActions = store.getActions();
    const expectedPayload = [
      {
        type: actions.DASHBOARD_CHARTS_START,
        chartId: 'customer',
        scope: customer,
      },
      {
        type: 'EMIT_SIGNAL',
        signal: 'organizationDashboard.initialized',
      }
    ];
    expect(currentActions).toEqual(expectedPayload);
  });
});
