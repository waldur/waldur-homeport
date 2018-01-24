import { mount } from 'enzyme';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { ResourceSummaryField } from './ResourceSummaryField';

describe('ResourceSummaryField', () => {
  it('renders flavor name and image name as tooltip', () => {
    const resource = {
      image_name: 'CentOS 7 x86_64',
      flavor_name: 'g1.small1',
      cores: 1,
      ram: 512,
      disk: 0,
    };
    const wrapper = mount(<ResourceSummaryField resource={resource} translate={translate}/>);
    expect(wrapper.find(Tooltip).prop('label')).toEqual('Flavor name: g1.small1, image name: CentOS 7 x86_64');
  });
});
