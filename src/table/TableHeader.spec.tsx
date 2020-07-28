import {
  renderWrapper,
  ORDERED_COLUMNS,
  UNORDERED_COLUMNS,
} from './TableHeader.fixture';

describe('TableHeader', () => {
  it('should render sorting icon when column specifies order field', () => {
    const currentSorting = { mode: '', field: null };
    const wrapper = renderWrapper(ORDERED_COLUMNS, currentSorting);
    expect(wrapper.find('.fa-sort').length).toBe(2);
  });

  it('should not render sorting icon if there are no columns with order field', () => {
    const currentSorting = { mode: '', field: null };
    const wrapper = renderWrapper(UNORDERED_COLUMNS, currentSorting);
    expect(wrapper.find('.fa-sort').length).toBe(0);
  });

  it('should render ascending sorting icon according to state', () => {
    const currentSorting = { mode: 'asc', field: 'phone_number' };
    const wrapper = renderWrapper(ORDERED_COLUMNS, currentSorting);
    expect(wrapper.find('.fa-sort-asc').length).toBe(1);
  });

  it('should render descending sorting icon according to state', () => {
    const currentSorting = { mode: 'desc', field: 'phone_number' };
    const wrapper = renderWrapper(ORDERED_COLUMNS, currentSorting);
    expect(wrapper.find('.fa-sort-desc').length).toBe(1);
  });

  it('should render column for expandable indicator if header has expandable row', () => {
    const wrapper = renderWrapper(UNORDERED_COLUMNS, undefined, true);
    expect(wrapper.find('th').length).toBe(UNORDERED_COLUMNS.length + 1);
  });
});
