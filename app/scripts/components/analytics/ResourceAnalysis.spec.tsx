import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { project } from './fixture';
import { PureResourceAnalysis } from './ResourceAnalysis';
import { ResourceAnalysisList } from './ResourceAnalysisList';

const initialProps = {
  searchValue: '',
  loading: false,
  projects: [project],
  onSearchFilterChange: x => x,
  fetchProjects: () => null,
  translate,
};

const renderWrapper = (props?) => shallow(<PureResourceAnalysis {...initialProps} {...props} />);

const getLoadingSpinner = (container: ShallowWrapper) => container.find(LoadingSpinner);
const getResourceAnalysisList = (container: ShallowWrapper) => container.find(ResourceAnalysisList);
const getTitle = (container: ShallowWrapper) => container.find('.ibox-title');
const getSearchInput = (container: ShallowWrapper) => container.find('.search-box input');

describe('ResourceAnalysis', () => {
  it('renders LoadingSpinner on loading', () => {
    const wrapper = renderWrapper();
    expect(getResourceAnalysisList(wrapper).length).toBe(1);
    expect(getLoadingSpinner(wrapper).length).toBe(0);
    wrapper.setProps({ loading: true });
    expect(getLoadingSpinner(wrapper).length).toBe(1);
    expect(getResourceAnalysisList(wrapper).length).toBe(0);
  });

  it('renders project count', () => {
    const wrapper = renderWrapper();
    expect(getTitle(wrapper).text().indexOf('1') !== -1).toBe(true);
  });

  it('invokes handler on input on change event', () => {
    const onSearchFilterChange = jest.fn();
    const wrapper = renderWrapper({ onSearchFilterChange });
    getSearchInput(wrapper).simulate('change');
    expect(onSearchFilterChange).toBeCalled();
  });
});
