import { shallow } from 'enzyme';

import { translate } from '@waldur/i18n';

import { comment } from './fixture';
import { IssueCommentItem } from './IssueCommentItem';
import { IssueCommentsList } from './IssueCommentsList';

const initialProps = {
  comments: [comment],
};
const renderWrapper = (props?) =>
  shallow(<IssueCommentsList {...initialProps} {...props} />);

const getIssueComment = (container) => container.find(IssueCommentItem);
const hasNoCommentsMessage = (container) =>
  container.contains(<div>{translate('There are no comments yet.')}</div>);
const hasErrorMessage = (container) =>
  container.contains(<div>{translate('Unable to load comments.')}</div>);

describe('IssueCommentsForm', () => {
  it('renders comments', () => {
    const wrapper = renderWrapper();
    expect(getIssueComment(wrapper).length).toBe(1);
    expect(hasNoCommentsMessage(wrapper)).toBe(false);
    wrapper.setProps({
      comments: [],
    });
    expect(getIssueComment(wrapper).length).toBe(0);
    expect(hasNoCommentsMessage(wrapper)).toBe(true);
  });

  it('renders error', () => {
    const wrapper = renderWrapper({
      erred: true,
    });
    expect(hasErrorMessage(wrapper)).toBe(true);
    expect(getIssueComment(wrapper).length).toBe(0);
    expect(hasNoCommentsMessage(wrapper)).toBe(false);
  });
});
