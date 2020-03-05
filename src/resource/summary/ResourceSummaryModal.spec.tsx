import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { ResourceSummary } from './ResourceSummary';
import { PureResourceSummaryModal } from './ResourceSummaryModal';

const initialProps = {
  loading: false,
  resource: {},
  fetchResource: () => null,
  translate,
};
const renderWrapper = (props?) =>
  shallow(<PureResourceSummaryModal {...initialProps} {...props} />);

const getSummary = (container: ShallowWrapper) =>
  container.find(ResourceSummary);
const getSpinner = (container: ShallowWrapper) =>
  container.find(LoadingSpinner);

describe('PureResourceSummaryModal', () => {
  it('Render ResourceSummary component.', () => {
    const wrapper = renderWrapper();
    expect(getSummary(wrapper).length).toBe(1);
    expect(getSpinner(wrapper).length).toBe(0);
  });

  it('Render LoadingSpinner component.', () => {
    const wrapper = renderWrapper({ loading: true });
    expect(getSummary(wrapper).length).toBe(0);
    expect(getSpinner(wrapper).length).toBe(1);
  });
});
