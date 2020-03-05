import { shallow } from 'enzyme';
import * as React from 'react';

import { eventGroups } from './fixtures';
import { TypeListDialog } from './TypeListDialog';

describe('TypeListDialog', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <TypeListDialog dialogTitle="Event types" types={eventGroups} />,
    );
  });

  it('renders each event group separately', () => {
    expect(wrapper.find('div').length).toBe(eventGroups.length);
  });

  it('renders each event type as list item', () => {
    expect(wrapper.find('li').length).toBe(5);
  });
});
