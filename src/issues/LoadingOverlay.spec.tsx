import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { LoadingOverlay } from './LoadingOverlay';

const renderWrapper = (options = {}) =>
  shallow(<LoadingOverlay {...options} />);

const hasSpinner = (wrapper: ShallowWrapper) => wrapper.find(LoadingSpinner).length === 1;
const hasClass = (wrapper: ShallowWrapper, className: string) => wrapper.find(`.${className}`).length === 1;
const hasMessage = (wrapper: ShallowWrapper) => wrapper.find('.loading-overlay__message').length === 1;

describe('LoadingOverlay', () => {
  it('renders spinner', () => {
    const wrapper = renderWrapper();
    expect(hasSpinner(wrapper)).toBe(true);
    expect(hasMessage(wrapper)).toBe(false);
  });

  it('renders message', () => {
    const wrapper = renderWrapper({ message: 'Test message.' });
    expect(hasMessage(wrapper)).toBe(true);
    expect(hasSpinner(wrapper)).toBe(false);
  });

  it('renders custom class', () => {
    const customClass = 'custom-class';
    const wrapper = renderWrapper({ className: customClass });
    expect(hasClass(wrapper, customClass)).toBe(true);
  });
});
