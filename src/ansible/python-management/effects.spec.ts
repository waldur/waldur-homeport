import * as actions from '@waldur/ansible/python-management/actions';
import { showSuccess } from '@waldur/store/coreSaga';

import { setupFixture } from './effects.fixture';

describe('Python Management side-effects', () => {
  const project = {uuid: 'uuid', name: 'name'};
  const pythonManagement = {uuid: '1111-2222'};

  let fixture;
  beforeEach(() => {
    fixture = setupFixture({
      workspace: {
        customer: {projects: [project]},
        project,
      },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows success message and redirects to details screen if python management has been created', async () => {
    fixture.mockCreatePythonManagement.mockReturnValue({data: pythonManagement});
    fixture.mockGotoPythonManagementDetails.mockReturnValue({});
    await fixture.createPythonManagement({payload: {pythonManagement}});
    expect(fixture.dispatched).toContainEqual(showSuccess('Python environment has been created.'));
  });

  it('rejects promise if python management update API request has failed', async () => {
    fixture.mockUpdatePythonManagement.mockReturnValue(Promise.reject({data: 'Not unique directory name - instance combination'}));
    await fixture.updatePythonManagement({payload: {project}});
    const createFailure = actions.updatePythonManagement.failure().type;
    expect(fixture.hasActionWithType(createFailure)).toBe(true);
  });
});
