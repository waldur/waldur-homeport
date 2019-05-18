import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { EventDetailsTable } from './EventDetailsTable';
import { event } from './fixtures';

jest.mock('@waldur/core/services', () => ({
  $state: {href: x => x},
}));

const renderTable = (props?) =>
  mount(
    <EventDetailsTable
      event={event}
      translate={translate}
      isStaffOrSupport={true}
      {...props}
    />
  );

const getRowLabels = (wrapper: ReactWrapper) =>
  wrapper.find('tr').map(tr => tr.find('td').first().text());

const getEventMessage = (wrapper: ReactWrapper) =>
  wrapper.find({label: 'Message'}).find('td').last().text();

describe('EventDetailsDialog', () => {
  it('renders table row for each field', () => {
    const wrapper = renderTable();
    const expected = ['Timestamp', 'User', 'IP address', 'Event type', 'Message'];
    expect(getRowLabels(wrapper)).toEqual(expected);
  });

  it('conceals row for empty field', () => {
    const wrapper = renderTable({event: {...event, message: undefined}});
    const expected = ['Timestamp', 'User', 'IP address', 'Event type'];
    expect(getRowLabels(wrapper)).toEqual(expected);
  });

  it('renders event message as is', () => {
    const wrapper = renderTable();
    expect(getEventMessage(wrapper)).toBe(event.message);
  });
});
