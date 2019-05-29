import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';
import { attachment } from '@waldur/issues/attachments/fixture';

import { comment, users } from './fixture';
import { PureIssueCommentItem } from './IssueCommentItem';

const initialProps = {
  user: users.same,
  comment,
  attachments: [attachment],
  translate,
};
const renderWrapper = (props?) => shallow(<PureIssueCommentItem {...initialProps} {...props} />);

const getDialogButton = (container: ShallowWrapper) => container.find('.comment-item__header a');
const getToggleButton = (container: ShallowWrapper) => container.find('.comment-item__edit');
const getDeleteButton = (container: ShallowWrapper) => container.find('.comment-item__delete');
const hasDeleteButton = (container: ShallowWrapper) => container.find('.comment-item__delete').length === 1;

describe('IssueCommentItem', () => {
  it('open user dialog', () => {
    const openUserDialog = jest.fn();
    const wrapper = renderWrapper({ openUserDialog });
    getDialogButton(wrapper).simulate('click');
    expect(openUserDialog).toBeCalled();
  });

  it('toggling form', () => {
    const toggleForm = jest.fn();
    const wrapper = renderWrapper({ toggleForm });
    getToggleButton(wrapper).simulate('click');
    expect(toggleForm).toBeCalled();
  });

  it('delete comment', () => {
    const openDeleteDialog = jest.fn();
    const wrapper = renderWrapper({ openDeleteDialog });
    getDeleteButton(wrapper).simulate('click');
    expect(openDeleteDialog).toBeCalled();
  });

  it('renders UI disabled', () => {
    const wrapper = renderWrapper({ uiDisabled: true });
    expect(getToggleButton(wrapper).prop('disabled')).toBe(true);
    expect(getDeleteButton(wrapper).prop('disabled')).toBe(true);
  });

  it('renders delete button for same author or staff only', () => {
    const wrapper = renderWrapper();
    expect(hasDeleteButton(wrapper)).toBe(true);
    wrapper.setProps({ user: users.different });
    expect(hasDeleteButton(wrapper)).toBe(false);
    wrapper.setProps({ user: users.staff });
    expect(hasDeleteButton(wrapper)).toBe(true);
  });
});
