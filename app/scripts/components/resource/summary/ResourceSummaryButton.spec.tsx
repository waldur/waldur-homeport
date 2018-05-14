import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureResorceSummaryButton } from './ResourceSummaryButton';

const initialProps = {
  resource: {},
  translate,
};
const renderWrapper = (props?) => shallow(<PureResorceSummaryButton {...initialProps} {...props} />);

const getButton = (container: ShallowWrapper) => container.find('.btn');

describe('ResorceSummaryButton', () => {
  it('Show modal on click', () => {
    const showDetailsModal = jest.fn();
    const wrapper = renderWrapper({ showDetailsModal });
    getButton(wrapper).simulate('click');
    expect(showDetailsModal).toBeCalled();
  });
});
