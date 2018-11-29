import { render } from 'enzyme';
import * as React from 'react';

import { ExpertRequestState } from './ExpertRequestState';

describe('ExpertRequestState', () => {
  it('renders warning icon if expert request has been cancelled', () => {
    const wrapper = render(<ExpertRequestState model={{state: 'Cancelled'}}/>);
    expect(wrapper.find('.progress-bar-danger').length).toBe(1);
    expect(wrapper.text()).toBe('CANCELLED');
  });

  it('renders success icon if expert request is completed', () => {
    const wrapper = render(<ExpertRequestState model={{state: 'Finished'}}/>);
    expect(wrapper.find('.progress-bar-success').length).toBe(1);
    expect(wrapper.text()).toBe('FINISHED');
  });
});
