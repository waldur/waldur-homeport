import { mount } from 'enzyme';
import * as React from 'react';

import HelpRegistry from '@waldur/help/help-registry';
import { translate } from '@waldur/i18n';

import { PureProviderHelpLink } from './ProviderHelpLink';

const renderLink = ({ name, isVisible }) => mount(
  <PureProviderHelpLink
    type={{name}}
    translate={translate}
    isVisible={() => isVisible}
  />
);

jest.mock('@waldur/core/services', () => ({
  $state: {href: x => x},
}));

HelpRegistry.register('providers', {
  type: 'providers',
  key: 'Azure',
  name: 'Azure provider',
});

describe('ProviderHelpLink', () => {
  it('renders link if feature is enabled and provider is available', () => {
    const wrapper = renderLink({name: 'Azure', isVisible: true});
    expect(wrapper.html()).not.toBe(null);
  });

  it('conceals link if feature is disabled', () => {
    const wrapper = renderLink({name: 'Azure', isVisible: false});
    expect(wrapper.html()).toBe(null);
  });

  it('conceals link if provider is not available', () => {
    const wrapper = renderLink({name: 'Amazon', isVisible: true});
    expect(wrapper.html()).toBe(null);
  });
});
