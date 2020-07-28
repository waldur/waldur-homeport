import * as React from 'react';

import { renderWrapper, ROW_UUID, COLUMNS } from './TableBody.fixture';

const expandableRow = () => <h3>Detailed info</h3>;

describe('TableBody', () => {
  it('should render cell for each column', () => {
    const wrapper = renderWrapper();
    expect(wrapper.find('td').length).toBe(COLUMNS.length);
  });

  it('should not render expandable indicator if expandable component is not provided', () => {
    const wrapper = renderWrapper();
    expect(wrapper.find('.fa-chevron-right').length).toBe(0);
    expect(wrapper.find('.fa-chevron-down').length).toBe(0);
  });

  it('should render untoggled expandable indicator if expandable component is provided', () => {
    const wrapper = renderWrapper({ expandableRow, toggled: {} });
    expect(wrapper.find('.fa-chevron-right').length).toBe(1);
    expect(wrapper.find('td').length).toBe(COLUMNS.length + 1);
  });

  it('should render toggled expandable indicator according to props', () => {
    const wrapper = renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(wrapper.find('.fa-chevron-down').length).toBe(1);
  });

  it('should render extra row if it is expanded', () => {
    const wrapper = renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(wrapper.find('h3').length).toBe(1);
  });
});
