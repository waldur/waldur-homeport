import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { DownloadLink } from './DownloadLink';

const renderLink = props => {
  const mockStore = configureStore();
  const store = mockStore({authToken: 'VALID_TOKEN'});
  const component = (
    <Provider store={store}>
      <DownloadLink {...props}/>
    </Provider>
  );
  return mount(component);
};

describe('DownloadLink', () => {
  const wrapper = renderLink({label: 'Download', url: 'http://example.com/link/'});

  it('appends query parameters to url', () => {
    const href = wrapper.find('a').prop('href');
    expect(href).toBe('http://example.com/link/?x-auth-token=VALID_TOKEN&download=true');
  });

  it('renders valid icon', () => {
    const icon = wrapper.find('i').prop('className');
    expect(icon).toBe('fa fa-external-link');
  });
});
