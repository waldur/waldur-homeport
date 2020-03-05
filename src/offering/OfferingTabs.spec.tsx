import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { OfferingTabs } from './OfferingTabs';
import { OFFERING } from './OfferingTabs.fixture';

const renderComponent = () => {
  const mockStore = configureStore();
  const store = mockStore({ config: { featuresVisible: true } });
  const wrapper = mount(
    <Provider store={store}>
      <OfferingTabs offering={OFFERING} summary="" />
    </Provider>,
  );
  return wrapper.html();
};

describe('OfferingTabs', () => {
  it('renders tabs for Oracle report and snapshots', () => {
    const html = renderComponent();
    expect(html).toMatchSnapshot();
  });
});
