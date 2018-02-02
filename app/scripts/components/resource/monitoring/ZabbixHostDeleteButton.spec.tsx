import { shallow } from 'enzyme';
import * as React from 'react';

import { translate } from '@waldur/i18n';

import { PureZabbixHostDeleteButton } from './ZabbixHostDeleteButton';

describe('ZabbixHostDeleteButton', () => {
  const renderButton = (props?) =>
    shallow(<PureZabbixHostDeleteButton translate={translate} {...props}/>);

  it('conceals button if resource could not be deleted', () => {
    const wrapper = renderButton({host: {state: 'Creating'}});
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('renders trash icon if resource is not yet deleting', () => {
    const wrapper = renderButton({host: {state: 'OK'}, deleting: false});
    expect(wrapper.find('i').prop('className')).toContain('fa-trash');
  });

  it('disables button if resource is already deleting', () => {
    const wrapper = renderButton({host: {state: 'OK'}, deleting: true});
    expect(wrapper.prop('disabled')).toBe(true);
  });

  it('renders spinner if resource is already deleting', () => {
    const wrapper = renderButton({host: {state: 'OK'}, deleting: true});
    expect(wrapper.find('i').prop('className')).toContain('fa-spinner');
  });
});
