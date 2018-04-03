import { parseProjects } from './api';

// tslint:disable
const fixture = require('./api.fixture.json');

describe('parseProjects', () => {
  it('parses quotas for projects', () => {
    const quotaNames = ['nc_ram_usage', 'nc_cpu_usage'];
    expect(parseProjects(fixture, quotaNames)).toMatchSnapshot();
  });
});
