import * as React from 'react';
import { mount } from 'enzyme';

import { DashboardFeed } from './DashboardFeed';
import { FeedItem } from './types';

const title = 'Title text';
const emptyText = 'Empty text';
const buttonTitle = 'Button Title';
const message1 = 'message 1';
const message2 = 'message 2';
const message3 = 'message 3';
const showAllUrl = 'https://example.com';

const onTranslate = x => x;

const items: FeedItem[] = [
  { html_message: `<span>${message1}</span>`, created: new Date('2015-05-21') },
  { html_message: `<a href="#">${message2}</a>`, created: new Date('2016-05-21') },
  { html_message: `<div>${message3}</div>`, created: new Date('2017-05-21') },
];

const createComponent = (loading, items, onShowDetails?, onShowTypes?) => {
  return mount(
    <DashboardFeed
      title={title}
      emptyText={emptyText}
      buttonTitle={buttonTitle}
      loading={loading}
      items={items}
      translate={onTranslate}
      showAllUrl={showAllUrl}
      showDetails={onShowDetails}
      showTypes={onShowTypes}
    />
  );
};

describe('DashboardFeed', () => {
  it('renders items if list is not empty', () => {
    const component = createComponent(false, items, undefined, () => { /* */ });

    const componentHtml = component.html();
    expect(componentHtml.includes(buttonTitle)).toBe(true);
    expect(componentHtml.includes(showAllUrl)).toBe(true);
    expect(componentHtml.includes(message1)).toBe(true);
    expect(componentHtml.includes(message2)).toBe(true);
    expect(componentHtml.includes(message3)).toBe(true);
  });

  it('renders spinner if list is loading', () => {
    const component = createComponent(true, items);

    const componentHtml = component.html();
    expect(componentHtml.includes(showAllUrl)).toBe(false);
    expect(componentHtml.includes(message1)).toBe(false);
    expect(componentHtml.includes(emptyText)).toBe(false);
    expect(componentHtml.includes('fa-spinner')).toBe(true);
  });

  it('renders the placeholder if list is empty', () => {
    const component = createComponent(false, []);

    const componentHtml = component.html();
    expect(componentHtml.includes(emptyText)).toBe(true);
  });

  it('the component\'s showTypes function gets called', () => {
    const onShowTypes = jest.fn();
    const component = createComponent(false, items, undefined, onShowTypes);

    component.find('.btn-link').first().simulate('click');
    expect(onShowTypes).toHaveBeenCalledTimes(1);
  });

  it('the component\'s showDetails function gets called', () => {
    const onShowDetails = jest.fn();
    const component = createComponent(false, items, onShowDetails, undefined);

    component.find('a.pull-right').first().simulate('click');
    expect(onShowDetails).toHaveBeenCalledTimes(1);
  });
});
