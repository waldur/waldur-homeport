import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { Tooltip } from '@waldur/core/Tooltip';

import { PriceTooltip } from './PriceTooltip';

describe('PriceTooltip', () => {
  const mockStore = configureStore();
  const renderTooltip = (store, props?) => mount(
    <Provider store={mockStore(store)}>
      <PriceTooltip {...props}/>
    </Provider>
  );

  const getLabel = wrapper => wrapper.find(Tooltip).props().label;
  const hasIcon = wrapper => wrapper.find('i').length === 1;

  it('does not render icon if billing mode is activated', () => {
    const wrapper = renderTooltip({config: {accountingMode: 'billing'}});
    expect(hasIcon(wrapper)).toBe(false);
  });

  it('renders icon if accounting mode is activated', () => {
    const wrapper = renderTooltip({config: {accountingMode: 'accounting'}});
    expect(hasIcon(wrapper)).toBe(true);
  });

  it('renders tooltip if accounting mode is activated', () => {
    const wrapper = renderTooltip({config: {accountingMode: 'accounting'}});
    expect(getLabel(wrapper)).toBe('VAT is not included.');
  });

  it('indicates that price is estimated', () => {
    const wrapper = renderTooltip({config: {accountingMode: 'accounting'}}, {estimated: true});
    expect(getLabel(wrapper)).toBe('VAT is not included. Price is estimated.');
  });
});
