import { mount } from 'enzyme';
import * as React from 'react';

import DashboardChart from './DashboardChart';

describe('DashboardChart', () => {
  it('renders valid class for positive change', () => {
    const chart = {
      title: 'Applications',
      current: 100,
      change: 10,
      data: [],
    };
    const wrapper = mount(<DashboardChart chart={chart} />);
    expect(wrapper.find('h5').text()).toBe('Applications');
    expect(wrapper.find('h1').text()).toBe('100');
    expect(wrapper.find('.text-info').length).toBe(1);
    expect(wrapper.find('.fa-level-up').length).toBe(1);
  });
});
