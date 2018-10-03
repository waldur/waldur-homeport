import { shallow } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { LoadingOverlay } from '@waldur/issues/LoadingOverlay';

import { comment, issue } from './fixture';
import { PureIssueCommentsContainer } from './IssueCommentsContainer';
import { IssueCommentsList } from './IssueCommentsList';

const initialProps = {
  comments: [comment],
  translate,
  issue,
  fetchComments: () => null,
  setIssue: x => x,
};
const renderWrapper = (props?) => shallow(<PureIssueCommentsContainer {...initialProps} {...props} />);

const getLoadingSpinner = container => container.find(LoadingSpinner);
const getIssueCommentsList = container => container.find(IssueCommentsList);
const getLoadingOverlay = container => container.find(LoadingOverlay);

describe('IssueCommentsContainer', () => {
  it('renders LoadingOverlay', () => {
    const wrapper = renderWrapper();
    expect(getLoadingOverlay(wrapper).length).toBe(0);
    wrapper.setState({ dropzoneActive: true });
    expect(getLoadingOverlay(wrapper).length).toBe(1);
  });

  it('renders LoadingSpinner on loading', () => {
    const wrapper = renderWrapper({ loading: true });
    expect(getLoadingSpinner(wrapper).length).toBe(1);
    expect(getIssueCommentsList(wrapper).length).toBe(0);
  });
});
