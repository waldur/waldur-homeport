import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { actWait, updateWrapper } from '@waldur/core/testUtils';

import * as api from './api';
import { ProjectCreateForm } from './ProjectCreateForm';

jest.mock('./api');

const apiMock = api as jest.Mocked<typeof api>;

jest.mock('@waldur/i18n', () => ({
  translate: jest.fn().mockImplementation((arg) => arg),
}));

const renderForm = async () => {
  const mockStore = configureStore();
  const store = mockStore({
    workspace: {},
    config: {
      FEATURES: [],
    },
  });
  const wrapper = mount(
    <Provider store={store}>
      <ProjectCreateForm onSubmit={jest.fn()} onCancel={jest.fn()} />
    </Provider>,
  );
  await actWait();

  expect(wrapper.find(LoadingSpinner)).toBeTruthy();

  await updateWrapper(wrapper);
  return wrapper;
};

describe('ProjectCreateForm', () => {
  it('conceals type selector if choices list is empty', async () => {
    apiMock.loadProjectTypes.mockResolvedValue([]);
    const wrapper = await renderForm();
    expect(wrapper.find({ label: 'Project type' }).length).toBeFalsy();
  });

  it('renders type selector if choices are available', async () => {
    const projectTypes = [{ name: 'Basic', url: 'VALID_URL' }];
    apiMock.loadProjectTypes.mockResolvedValue(projectTypes);
    const wrapper = await renderForm();
    expect(wrapper.find({ label: 'Project type' }).length).toBeTruthy();
  });
});
