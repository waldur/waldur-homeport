import { shallow } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { ProviderUpdateComponent } from './ProviderUpdateComponent';
import { ProviderUpdateForm } from './ProviderUpdateForm';

const renderProvider = (props?) => shallow(
  <ProviderUpdateComponent
    translate={translate}
    fetchProvider={jest.fn()}
    updateProvider={jest.fn()}
    defaultErrorMessage="Reason unknown, please contact support."
    editable={true}
    loaded={true}
    erred={false}
    provider={{state: 'OK'}}
    {...props}
  />
);

describe('ProviderUpdateComponent', () => {
  it('renders error message if it was unable to load', () => {
    const wrapper = renderProvider({erred: true});
    expect(wrapper.find('h3').text()).toBe('Unable to load provider.');
  });

  it('renders placeholder if provider is still loading', () => {
    const wrapper = renderProvider({erred: false, loaded: false});
    expect(wrapper.find(LoadingSpinner).length).toBe(1);
  });

  it('renders warning if provider is not editable', () => {
    const wrapper = renderProvider({editable: false});
    expect(wrapper.find('.bs-callout').text()).toMatch(/You don't have enough permissions to edit settings/);
  });

  it('renders warning if provider is erred', () => {
    const wrapper = renderProvider({provider: {state: 'Erred'}});
    expect(wrapper.find('.bs-callout-danger').text()).toBe('Reason unknown, please contact support.');
    expect(wrapper.find(ProviderUpdateForm).length).toBe(1);
  });

  it('renders message if provider is in progress', () => {
    const wrapper = renderProvider({provider: {state: 'Updating'}});
    expect(wrapper.find('.bs-callout-success').text()).toBe('Please wait while provider is being configured.');
    expect(wrapper.find(ProviderUpdateForm).length).toBe(1);
  });
});
