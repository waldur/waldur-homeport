import { shallow } from 'enzyme';

import { translate } from '@waldur/i18n';

import { ProjectCreateForm } from './ProjectCreateForm';

const renderForm = (props) =>
  shallow(
    <ProjectCreateForm
      translate={translate}
      handleSubmit={jest.fn()}
      projectTypes={[]}
      customer={{ projects: [] }}
      {...props}
    />,
  );

describe('ProjectCreateForm', () => {
  it('conceals type selector if choices list is empty', () => {
    const wrapper = renderForm({ projectTypes: [] });
    expect(wrapper.find({ label: 'Project type' }).length).toBe(0);
  });

  it('renders type selector if choices are available', () => {
    const projectTypes = [{ name: 'Basic', url: 'VALID_URL' }];
    const wrapper = renderForm({ projectTypes });
    expect(wrapper.find({ label: 'Project type' }).length).toBe(1);
  });
});
