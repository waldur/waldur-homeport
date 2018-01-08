import { shallow } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { IssueAttachmentLoading } from './IssueAttachmentLoading';

describe('IssueAttachmentLoading', () => {
  const renderWrapper = () => shallow(<IssueAttachmentLoading />);

  it('renders corectly', () => {
    const wrapper = renderWrapper();
    expect(wrapper.find(LoadingSpinner).length).toBe(1);
  });
});
