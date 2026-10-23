import { describe, expect, it } from 'vitest';
import { Resource } from 'waldur-js-client';

import { groupResourcesByProject } from './utils';

const resource = (uuid: string, project_uuid: string) =>
  ({
    uuid,
    project_uuid,
    project_name: `Project ${project_uuid}`,
    customer_name: 'Org',
    customer_uuid: 'org',
  }) as Resource;

describe('groupResourcesByProject', () => {
  it('groups resources by project, in the order projects first appear', () => {
    const projects = groupResourcesByProject([
      resource('r1', 'p2'),
      resource('r2', 'p1'),
      resource('r3', 'p2'),
    ]);

    expect(projects.map((project) => project.uuid)).toEqual(['p2', 'p1']);
    expect(projects[0]).toMatchObject({
      name: 'Project p2',
      customerName: 'Org',
      customerUuid: 'org',
    });
    expect(projects[0].resources.map((r) => r.uuid)).toEqual(['r1', 'r3']);
    expect(projects[1].resources.map((r) => r.uuid)).toEqual(['r2']);
  });

  it('gives no projects for no resources', () => {
    expect(groupResourcesByProject([])).toEqual([]);
  });
});
