import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { ZabbixHostDetailsButton } from './ZabbixHostDetailsButton';
import { PureZabbixHostStateButton } from './ZabbixHostStateButton';

const renderButton = host =>
  shallow(
    <PureZabbixHostStateButton
      translate={translate}
      host={host}
    />
  );

describe('ZabbixHostStateButton', () => {
  it('renders valid message if resource is OK', () => {
    const wrapper = renderButton({state: 'OK'});
    expect(wrapper.find(ZabbixHostDetailsButton).prop('textClass')).toBe('text-info');
    expect(wrapper.find(ZabbixHostDetailsButton).prop('label')).toBe('Resource is monitored using Zabbix.');
  });

  it('renders valid message if resource is erred', () => {
    const wrapper = renderButton({state: 'Erred'});
    expect(wrapper.find(ZabbixHostDetailsButton).prop('textClass')).toBe('text-danger');
    expect(wrapper.find(ZabbixHostDetailsButton).prop('label')).toBe('Monitoring system has failed.');
  });
});
