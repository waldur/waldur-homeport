import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { OpenStackSecurityGroupsLink, openDetailsDialog } from './OpenStackSecurityGroupsLink';

const mockStore = configureStore();
const store = mockStore();

export const renderLink = props => {
  return mount(
    <Provider store={store}>
      <OpenStackSecurityGroupsLink {...props}/>
    </Provider>
  );
};

describe('OpenStackSecurityGroupsLink', () => {
  it('renders placeholder if items list is empty', () => {
    const wrapper = renderLink({items: []});
    expect(wrapper.text()).toBe('—');
  });

  it('renders comma separated list of security group names', () => {
    const items = [
      {name: 'ssh'},
      {name: 'default'},
    ];
    const wrapper = renderLink({ items });
    expect(wrapper.text()).toBe('ssh, default');
  });

  it('opens modal dialog when user clicks on link', () => {
    const items = [
      {name: 'ssh'},
      {name: 'default'},
    ];
    const wrapper = renderLink({ items });
    wrapper.find({className: 'cursor-pointer'}).simulate('click');
    const actions = store.getActions();
    expect(actions[0]).toEqual(openDetailsDialog(items));
  });
});
