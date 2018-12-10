import { showSuccess, emitSignal } from '@waldur/store/coreSaga';

import * as actions from './actions';
import { setupFixture } from './effects.fixture';

describe('Project side-effects', () => {
  const project = {uuid: 'uuid', name: 'name'};

  let fixture;
  beforeEach(() => {
    fixture = setupFixture({workspace: {customer: {projects: []}}});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('invalidates projects list cache if project has been updated', async () => {
    fixture.mockUpdateProject.mockReturnValue({data: project});
    await fixture.updateProject({payload: {project}});
    expect(fixture.dispatched).toContainEqual(emitSignal('refreshProjectList', {project}));
  });

  it('shows success message if project has been updated', async () => {
    fixture.mockUpdateProject.mockReturnValue({data: project});
    await fixture.updateProject({payload: {project}});
    expect(fixture.dispatched).toContainEqual(showSuccess('Project has been updated.'));
  });

  it('rejects promise if project update API request has failed', async () => {
    fixture.mockUpdateProject.mockReturnValue(Promise.reject({data: 'Name is duplicate.'}));
    await fixture.updateProject({payload: {project}});
    const createFailure = actions.updateProject.failure().type;
    expect(fixture.hasActionWithType(createFailure)).toBe(true);
  });
});
