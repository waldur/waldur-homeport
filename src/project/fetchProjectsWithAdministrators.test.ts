import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsList, projectsListUsersList } from 'waldur-js-client';

import {
  ADMINISTRATORS_FIELD,
  fetchProjectsWithAdministrators,
} from './fetchProjectsWithAdministrators';

const page = (...uuids: string[]) => ({
  data: uuids.map((uuid) => ({ uuid })),
  response: {
    headers: new Headers({
      'content-type': 'application/json',
      'x-result-count': String(uuids.length),
    }),
  },
});

const request = (field?: unknown[], signal?: AbortSignal) => ({
  currentPage: 1,
  pageSize: 10,
  filter: { customer: 'org', field },
  options: { signal },
});

const sentFields = () => vi.mocked(projectsList).mock.calls[0][0].query.field;

describe('fetchProjectsWithAdministrators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectsListUsersList).mockImplementation(
      ({ path }: any) =>
        Promise.resolve({
          data: [{ user_full_name: `Admin of ${path.uuid}` }],
        }) as any,
    );
  });

  it('adds each project its administrators, keeping the page intact', async () => {
    vi.mocked(projectsList).mockResolvedValue(page('p1', 'p2') as any);

    const result = await fetchProjectsWithAdministrators(
      request(['uuid', ADMINISTRATORS_FIELD]) as any,
    );

    expect(result.rows).toEqual([
      { uuid: 'p1', administrators: [{ user_full_name: 'Admin of p1' }] },
      { uuid: 'p2', administrators: [{ user_full_name: 'Admin of p2' }] },
    ]);
    expect(result.resultCount).toBe(2);
  });

  it('keeps the column key away from the projects endpoint', async () => {
    vi.mocked(projectsList).mockResolvedValue(page() as any);

    await fetchProjectsWithAdministrators(
      request(['uuid', ADMINISTRATORS_FIELD]) as any,
    );

    expect(sentFields()).toEqual(['uuid']);
  });

  it('finds the column key among the nested keys of an export', async () => {
    vi.mocked(projectsList).mockResolvedValue(page('p1') as any);

    await fetchProjectsWithAdministrators(
      request(['name', ['uuid', ADMINISTRATORS_FIELD]]) as any,
    );

    expect(sentFields()).toEqual(['name', 'uuid']);
    expect(projectsListUsersList).toHaveBeenCalledTimes(1);
  });

  it('leaves the request it was given alone for the next page', async () => {
    vi.mocked(projectsList).mockResolvedValue(page('p1') as any);
    const nested = ['name', ['uuid', ADMINISTRATORS_FIELD]];
    const exportRequest = request(nested) as any;

    await fetchProjectsWithAdministrators(exportRequest);

    expect(exportRequest.filter.field).toBe(nested);
  });

  it('looks nobody up while the column is turned off', async () => {
    vi.mocked(projectsList).mockResolvedValue(page('p1') as any);

    const result = await fetchProjectsWithAdministrators(
      request(['uuid', 'name']) as any,
    );

    expect(projectsListUsersList).not.toHaveBeenCalled();
    expect(result.rows).toEqual([{ uuid: 'p1' }]);
  });

  it('keeps the table when a team is refused to the viewer', async () => {
    vi.mocked(projectsList).mockResolvedValue(page('p1', 'p2') as any);
    vi.mocked(projectsListUsersList).mockImplementation(
      ({ path }: any) =>
        (path.uuid === 'p1'
          ? Promise.reject({ detail: 'You do not have permission.' })
          : Promise.resolve({ data: [{ user_full_name: 'Bob' }] })) as any,
    );

    const result = await fetchProjectsWithAdministrators(
      request([ADMINISTRATORS_FIELD]) as any,
    );

    expect(result.rows).toEqual([
      { uuid: 'p1', administrators: undefined },
      { uuid: 'p2', administrators: [{ user_full_name: 'Bob' }] },
    ]);
  });

  it('cancels the lookups along with the table request', async () => {
    vi.mocked(projectsList).mockResolvedValue(page('p1') as any);
    const { signal } = new AbortController();

    await fetchProjectsWithAdministrators(
      request([ADMINISTRATORS_FIELD], signal) as any,
    );

    expect(vi.mocked(projectsListUsersList).mock.calls[0][0].signal).toBe(
      signal,
    );
  });

  it('runs a limited number of lookups at a time', async () => {
    const uuids = Array.from({ length: 40 }, (_, index) => `p${index}`);
    vi.mocked(projectsList).mockResolvedValue(page(...uuids) as any);
    let running = 0;
    let busiest = 0;
    vi.mocked(projectsListUsersList).mockImplementation(async () => {
      busiest = Math.max(busiest, ++running);
      await Promise.resolve();
      running--;
      return { data: [] } as any;
    });

    const result = await fetchProjectsWithAdministrators(
      request([ADMINISTRATORS_FIELD]) as any,
    );

    expect(result.rows).toHaveLength(40);
    expect(busiest).toBeLessThanOrEqual(8);
  });
});
