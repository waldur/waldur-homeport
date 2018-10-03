import { JupyterHubManagementDetailsFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementDetailsFormData';
import { showSuccess } from '@waldur/store/coreSaga';

import * as actions from './actions';
import { setupFixture } from './effects.fixture';

describe('JupyterHub Management side-effects', () => {
  const project = {uuid: 'uuid', name: 'name'};
  const jupyterHubManagement = {uuid: '3333-4444'};

  let fixture;
  beforeEach(() => {
    fixture = setupFixture({
      workspace: {
        customer: {projects: [project]},
        project,
      },
      config: {
        plugins: {
          WALDUR_ANSIBLE_COMMON: {
            ANSIBLE_REQUEST_TIMEOUT: 3600,
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows success message and redirects to details screen if JupyterHub management has been created', async () => {
    fixture.mockCreateJupyterHubManagement.mockReturnValue({data: jupyterHubManagement});
    fixture.mockGotoJupyterHubManagementDetails.mockReturnValue({});

    await fixture.createJupyterHubManagement({payload: jupyterHubManagement});

    expect(fixture.dispatched).toContainEqual(showSuccess('JupyterHub environment has been created.'));
  });

  it('rejects promise if JupyterHub management update API request has failed', async () => {
    fixture.mockUpdateJupyterHubManagement.mockReturnValue(Promise.reject({data: 'Not unique instance!'}));

    await fixture.updateJupyterHubManagement({payload: jupyterHubManagement});

    const createFailure = actions.updateJupyterHubManagement.failure().type;
    expect(fixture.hasActionWithType(createFailure)).toBe(true);
  });

  it('reloads details screen after update', async () => {
    fixture.mockUpdateJupyterHubManagement.mockReturnValue(Promise.resolve());
    fixture.mockMergeVirtualEnvironments.mockReturnValue(Promise.resolve());
    fixture.mockSetRequestsStateTypePairs.mockReturnValue(Promise.resolve());
    fixture.mockMergeRequests.mockReturnValue(Promise.resolve());
    fixture.mockLoadJupyterHubManagement.mockReturnValue({jupyter_hub_management: {requests_states: []}});
    fixture.mockBuildJupyterHubManagementDetailsFormData.mockReturnValue(new JupyterHubManagementDetailsFormData());

    await fixture.updateJupyterHubManagement({payload: jupyterHubManagement});

    expect(fixture.mockMergeVirtualEnvironments).toBeCalled();
    expect(fixture.mockSetRequestsStateTypePairs).toBeCalled();
    expect(fixture.mockMergeRequests).toBeCalled();
    expect(fixture.dispatched).toContainEqual(showSuccess('JupyterHub configuration update have been scheduled.'));
  });
})
;
