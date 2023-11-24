import { render } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { RootState } from '@waldur/store/reducers';

import { QuotasTable } from './QuotasTable';

const quotas = require('./QuotasTable.fixture.json');

const renderComponent = (resource) => {
  const mockStore = configureStore();
  const storeData: Partial<RootState> = {
    theme: {
      themes: [],
      theme: 'dark',
    },
  };
  const store = mockStore(storeData);

  const component = (
    <Provider store={store}>
      <QuotasTable resource={resource} />
    </Provider>
  );
  const wrapper = render(component);
  return wrapper.html();
};

describe('QuotasTable', () => {
  it('renders table for quotas', () => {
    const html = renderComponent({ quotas });
    expect(html).toMatchSnapshot();
  });
});
