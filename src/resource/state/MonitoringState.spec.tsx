import { render } from 'enzyme';
import * as React from 'react';

import { MonitoringState } from './MonitoringState';

describe('MonitoringState', () => {
  it('renders warning if monitoring is erred', () => {
    const wrapper = render(
      <MonitoringState resource={{ monitoring_state: 'Erred' }} />,
    );
    expect(wrapper.find('.progress-bar-danger').length).toBe(1);
  });

  it('renders info class if monitoring is okay', () => {
    const wrapper = render(
      <MonitoringState resource={{ monitoring_state: 'OK' }} />,
    );
    expect(wrapper.find('.progress-bar-info').length).toBe(1);
  });

  it('renders plain class if monitoring is not connected yet', () => {
    const wrapper = render(
      <MonitoringState resource={{ monitoring_state: 'Unregistered' }} />,
    );
    expect(wrapper.find('.progress-bar-plain').length).toBe(1);
  });
});
