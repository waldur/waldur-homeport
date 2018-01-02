import { shallow } from 'enzyme';
import * as React from 'react';

import { DownloadLink } from '@waldur/core/DownloadLink';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';

import { ResourceAccessInfo } from './ResourceAccessInfo';

const renderComponent = resource => shallow(
  <ResourceAccessInfo
    resource={resource}
    translate={translate}
  />
);

describe('ResourceAccessInfo', () => {
  it('renders placeholder if access url is not defined', () => {
    const wrapper = renderComponent({});
    expect(wrapper.text()).toBe('No access info');
  });

  it('renders comma separated list', () => {
    const ips = ['10.1.0.100', '192.168.1.203'];
    const wrapper = renderComponent({access_url: ips});
    expect(wrapper.text()).toBe(ips.join(', '));
  });

  it('renders download link for RDP', () => {
    const url = 'http://example.com/api/azure-virtual-machines/1/rdp/';
    const wrapper = renderComponent({ access_url: url });
    const actual = wrapper.find(DownloadLink).prop('url');
    expect(actual).toBe(url);
  });

  it('renders external link otherwise', () => {
    const url = 'http://example.com/horizon/';
    const wrapper = renderComponent({ access_url: url });
    const actual = wrapper.find(ExternalLink).prop('url');
    expect(actual).toBe(url);
  });
});
