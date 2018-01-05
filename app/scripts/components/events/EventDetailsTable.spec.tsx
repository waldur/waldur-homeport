import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { EventDetailsTable } from './EventDetailsTable';
import { Event } from './types';

jest.mock('@waldur/core/services', () => ({
  $state: {href: x => x},
}));

const event: Event = {
  event_type: 'auth_logged_in_with_username',
  importance: 'normal',
  user_uuid: 'a45c8927e176455781f63e7c7baf9567',
  user_username: 'alice',
  user_full_name: 'Alice Lebowski',
  ['@timestamp']: '2018-01-05T04:47:04.982Z',
  ip_address: '8.8.8.8',
  message: 'User alice with full name Alice Lebowski authenticated successfully with username and password.',
};

const renderTable = (props?) =>
  mount(<EventDetailsTable event={event} translate={translate} {...props}/>);

const getRowLabels = (wrapper: ReactWrapper) =>
  wrapper.find('tr').map(tr => tr.find('td').first().text());

const getEventMessage = (wrapper: ReactWrapper) =>
  wrapper.find({label: 'Message'}).find('td').last().text();

describe('EventDetailsDialog', () => {
  it('renders table row for each field', () => {
    const wrapper = renderTable();
    const expected = ['Timestamp', 'User', 'IP address', 'Importance', 'Event type', 'Message'];
    expect(getRowLabels(wrapper)).toEqual(expected);
  });

  it('conceals row for empty field', () => {
    const wrapper = renderTable({event: {...event, message: undefined}});
    const expected = ['Timestamp', 'User', 'IP address', 'Importance', 'Event type'];
    expect(getRowLabels(wrapper)).toEqual(expected);
  });

  it('renders event message as is', () => {
    const wrapper = renderTable();
    expect(getEventMessage(wrapper)).toBe(event.message);
  });
});
