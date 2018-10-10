import { shallow } from 'enzyme';
import * as React from 'react';

import { AttributeCell } from './AttributeCell';
import { ListAttribute, ChoiceAttribute, BooleanAttribute, StringAttribute } from './AttributeCell.fixtures';

describe('AttributeCell', () => {
  it('renders list attribute', () => {
    const wrapper = shallow(<AttributeCell attr={ListAttribute} value={['E5-2650v3', 'E5-2680v3']} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders choice attribute', () => {
    const wrapper = shallow(<AttributeCell attr={ChoiceAttribute} value="gpu_NVidia_K80" />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders invalid choice attribute', () => {
    const wrapper = shallow(<AttributeCell attr={ChoiceAttribute} value="invalid" />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders boolean value', () => {
    const wrapper = shallow(<AttributeCell attr={BooleanAttribute} value={true} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders negative boolean value', () => {
    const wrapper = shallow(<AttributeCell attr={BooleanAttribute} value={false} />);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders string attribute', () => {
    const wrapper = shallow(<AttributeCell attr={StringAttribute} value="/opt/" />);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
