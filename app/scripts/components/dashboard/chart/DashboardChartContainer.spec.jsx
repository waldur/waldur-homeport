import React from 'react';
import { shallow, mount, render } from 'enzyme';
import configureStore from 'redux-mock-store';

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
  const customer = {};
  let store, container;

  beforeEach(() => {
    store = mockStore(initialState);
    container = mount(
      <DashboardChartContainer
        store={store}
        scope={customer}
        signal='organizationDashboard.initialized'
        chartId='customer'/>
    );
  });

  it('renders component with valid properties', () => {
    expect(container.find(DashboardChartList).prop('loading')).toBe(false);
    expect(container.find(DashboardChartList).prop('charts')).toEqual([chart]);
  });

  it('emits valid actions', () => {
    const actions = store.getActions();
    const expectedPayload = [
      {
        type: 'DASHBOARD_CHARTS_START',
        chartId: 'customer',
        scope: customer,
      },
      {
        type: 'EMIT_SIGNAL',
        signal: 'organizationDashboard.initialized',
      }
    ];
    expect(actions).toEqual(expectedPayload);
  });
});
