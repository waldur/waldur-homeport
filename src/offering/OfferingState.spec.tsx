import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { OfferingState } from './OfferingState';

const renderState = state => {
  const mockStore = configureStore();
  const store = mockStore({});
  return mount(
    <Provider store={store}>
      <OfferingState offering={{state}}/>
    </Provider>
  );
};

describe('OfferingState', () => {
  it('renders warning if offering is terminated', () => {
    const wrapper = renderState('Terminated');
    expect(wrapper.find('.progress-bar-danger').length).toBe(1);
  });

  it('renders primary class if offering is okay', () => {
    const wrapper = renderState('OK');
    expect(wrapper.find('.progress-bar-primary').length).toBe(1);
  });

  it('renders active class if offering is requested', () => {
    const wrapper = renderState('Requested');
    expect(wrapper.find('.active').length).toBe(1);
  });
});
