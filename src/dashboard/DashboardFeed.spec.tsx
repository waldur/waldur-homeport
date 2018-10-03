import { mount } from 'enzyme';
import * as React from 'react';

import { formatTemplate } from '@waldur/i18n';

import { DashboardFeed } from './DashboardFeed';
import { FeedItem } from './types';

const items: FeedItem[] = [
  {
    html_message: 'User has logged in',
    created: new Date('2017-11-21'),
  },
  {
    html_message: 'User has created project',
    created: new Date('2017-11-22'),
  },
];

const renderFeed = props => mount(
  <DashboardFeed
    title="Events feed"
    emptyText="No events yet"
    items={items}
    translate={formatTemplate}
    {...props}
  />
);

const getItems = wrapper => wrapper.find('.feed-element');
const hasSpinner = wrapper => wrapper.find('.fa-spinner').length === 1;
const hasPlaceholder = wrapper => wrapper.html().includes('No events yet');
const clickTypesButton = wrapper => wrapper.find('.btn-link').first().simulate('click');
const clickDetailsButton = wrapper => wrapper.find('a.pull-right').first().simulate('click');

describe('DashboardFeed', () => {
  it('renders spinner if list is loading', () => {
    const wrapper = renderFeed({loading: true});
    expect(hasSpinner(wrapper)).toBe(true);
  });

  it('renders placeholder if list is empty', () => {
    const wrapper = renderFeed({loading: false, items: []});
    expect(hasPlaceholder(wrapper)).toBe(true);
  });

  it('renders items if list is not empty', () => {
    const wrapper = renderFeed({loading: false, items});
    expect(getItems(wrapper).length).toBe(items.length);
  });

  it('when types button is clicked showTypes is called', () => {
    const showTypes = jest.fn();
    const wrapper = renderFeed({loading: false, items, showTypes});
    clickTypesButton(wrapper);
    expect(showTypes).toHaveBeenCalled();
  });

  it('when details button is clicked showDetails is called', () => {
    const showDetails = jest.fn();
    const wrapper = renderFeed({loading: false, items, showDetails});
    clickDetailsButton(wrapper);
    expect(showDetails).toHaveBeenCalled();
  });
});
