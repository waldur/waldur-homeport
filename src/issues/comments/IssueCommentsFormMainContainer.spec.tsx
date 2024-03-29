import { shallow } from 'enzyme';

import { translate } from '@waldur/i18n';

import * as constants from './constants';
import { PureIssueCommentsFormMainContainer } from './IssueCommentsFormMainContainer';

const initialProps = {
  formId: constants.MAIN_FORM_ID,
};
const renderWrapper = (props?) =>
  shallow(<PureIssueCommentsFormMainContainer {...initialProps} {...props} />);

const clickTogglerButton = (container) =>
  container.find('.btn.btn-secondary').simulate('click');
const hasOpenedContent = (container) =>
  container.contains(
    <span className="text-muted">{translate('Comment')}</span>,
  );
const hasClosedContent = (container) =>
  container.contains(
    <button className="btn btn-secondary">
      <i className="fa fa-comment-o" />
      <span className="p-w-xs">{translate('Add comment')}</span>
    </button>,
  );

describe('IssueCommentsFormMainContainer', () => {
  it('toggle content', () => {
    const toggle = jest.fn();
    const wrapper = renderWrapper({ toggle });
    clickTogglerButton(wrapper);
    expect(toggle).toBeCalled();
  });

  it('renders opened and closed content', () => {
    const wrapper = renderWrapper();

    expect(hasOpenedContent(wrapper)).toBe(false);
    expect(hasClosedContent(wrapper)).toBe(true);
    wrapper.setProps({ opened: true });
    expect(hasOpenedContent(wrapper)).toBe(true);
    expect(hasClosedContent(wrapper)).toBe(false);
  });
});
