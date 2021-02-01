import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { SupportTabs } from './SupportTabs';
import { FakeResource } from './SupportTabs.fixture';

const renderComponent = () => {
  const mockStore = configureStore();
  const store = mockStore({ config: { featuresVisible: true } });
  const wrapper = mount(
    <Provider store={store}>
      <SupportTabs resource={FakeResource} summary="" />
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
