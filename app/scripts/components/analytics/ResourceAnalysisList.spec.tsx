import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { project } from './fixture';
import { ResourceAnalysisItem } from './ResourceAnalysisItem';
import { ResourceAnalysisList } from './ResourceAnalysisList';

const initialProps = {
  projects: [project],
};
const renderWrapper = (props?) => shallow(<ResourceAnalysisList {...initialProps} {...props} />);

const getResourceAnalysisItem = (container: ShallowWrapper) => container.find(ResourceAnalysisItem);

describe('ResourceAnalysisList', () => {
  it('renders ResourceAnalysisItem', () => {
    const wrapper = renderWrapper();
    expect(getResourceAnalysisItem(wrapper).length).toBe(1);
    wrapper.setProps({projects: []});
    expect(getResourceAnalysisItem(wrapper).length).toBe(0);
  });
});
