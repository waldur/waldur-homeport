import { render, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

export function testFullSnapshot(node, initialState = {}) {
  const store = mockStore(initialState);
  const wrapper = render(
    <Provider store={store}>
      {node}
    </Provider>
  );
  expect(toJson(wrapper as any)).toMatchSnapshot();
}

export function testShallowSnapshot(node) {
  const wrapper = shallow(node);
  expect(toJson(wrapper)).toMatchSnapshot();
}
