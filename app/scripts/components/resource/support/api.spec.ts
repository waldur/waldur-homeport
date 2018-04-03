import { parseProjects } from './api';

// tslint:disable-next-line
const fixture = require('./api.fixture.json');

describe('parseProjects', () => {
  it('parses quotas for projects', () => {
    const quotaNames = ['nc_ram_usage', 'nc_cpu_usage', 'current_price'];
    expect(parseProjects(fixture, quotaNames)).toMatchSnapshot();
  });
});
