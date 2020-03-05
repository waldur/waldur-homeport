import { mount } from 'enzyme';
import * as React from 'react';

import { FileUploadField } from './FileUploadField';

const renderField = (props?) =>
  mount(
    <FileUploadField
      name="password"
      label="Password"
      buttonLabel="Browse"
      showFileName={true}
      {...props}
    />,
  );

const file = {
  type: 'image/png',
  name: 'profile.png',
};

const event = {
  target: {
    files: [file],
  },
};

describe('FileUploadField', () => {
  it('renders placeholder for filename by default', () => {
    const wrapper = renderField();
    expect(wrapper.text()).toContain('None');
  });

  it('ignores invalid file type', () => {
    const handler = jest.fn();
    const wrapper = renderField({
      accept: 'application/text',
      input: { onChange: handler },
    });
    wrapper.find('input').simulate('change', event);
    expect(handler).toBeCalledWith(null);
    expect(wrapper.text()).not.toContain(file.name);
  });

  it('accepts valid file type', () => {
    const handler = jest.fn();
    const wrapper = renderField({
      accept: 'image/png',
      input: { onChange: handler },
    });
    wrapper.find('input').simulate('change', event);
    expect(handler).toBeCalledWith(file);
    expect(wrapper.text()).toContain(file.name);
  });

  it('accepts any file type if requirement is not specified', () => {
    const handler = jest.fn();
    const wrapper = renderField({
      input: { onChange: handler },
    });
    wrapper.find('input').simulate('change', event);
    expect(handler).toBeCalledWith(file);
    expect(wrapper.text()).toContain(file.name);
  });
});
