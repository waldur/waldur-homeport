import { render } from 'enzyme';
import * as React from 'react';

import { ProviderState } from './ProviderState';

describe('ProviderState', () => {
  it('renders warning if provider is erred', () => {
    const wrapper = render(<ProviderState provider={{state: 'Erred'}}/>);
    expect(wrapper.find('.progress-bar-danger').length).toBe(1);
  });

  it('renders primary class if provider is okay', () => {
    const wrapper = render(<ProviderState provider={{state: 'OK'}}/>);
    expect(wrapper.find('.progress-bar-primary').length).toBe(1);
  });

  it('renders active class if action is pending', () => {
    const wrapper = render(<ProviderState provider={{state: 'Creation Scheduled'}}/>);
    expect(wrapper.find('.active').length).toBe(1);
  });
});
