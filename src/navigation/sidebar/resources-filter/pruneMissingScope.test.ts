import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customersRetrieve, projectsRetrieve } from 'waldur-js-client';

import { pruneMissingScope } from './pruneMissingScope';

const ORG = { uuid: 'org-1', name: 'Physics', abbreviation: 'PHY' };
const PROJECT = {
  uuid: 'project-1',
  name: 'Climate',
  url: '',
  customer_uuid: 'org-1',
  is_industry: false,
};

const scope = (over: any = {}) => ({
  organization: ORG,
  project: PROJECT,
  ...over,
});

const missing = () => Promise.reject({ response: { status: 404 } });
const found = () => Promise.resolve({ data: {} });

describe('pruneMissingScope', () => {
  beforeEach(() => {
    vi.mocked(customersRetrieve)
      .mockReset()
      .mockImplementation(found as any);
    vi.mocked(projectsRetrieve)
      .mockReset()
      .mockImplementation(found as any);
  });

  it('costs nothing when there is no stored scope', async () => {
    const empty = { organization: null, project: null };

    await expect(pruneMissingScope(empty)).resolves.toBe(empty);
    expect(customersRetrieve).not.toHaveBeenCalled();
    expect(projectsRetrieve).not.toHaveBeenCalled();
  });

  it('returns the same reference when both still resolve', async () => {
    // Callers skip the write on reference equality, so this is the hot path.
    const current = scope();

    await expect(pruneMissingScope(current)).resolves.toBe(current);
  });

  // The regression this exists for: a scope naming an organisation that has
  // been deleted (or that the user was removed from) filters every catalog to
  // nothing, and the list endpoints report that as an empty page rather than
  // an error, so nothing else can notice.
  it('drops an organisation that no longer resolves, and the project under it', async () => {
    vi.mocked(customersRetrieve).mockImplementation(missing as any);

    await expect(pruneMissingScope(scope())).resolves.toEqual({
      organization: null,
      project: null,
    });
  });

  it('drops only the project when the organisation is still good', async () => {
    vi.mocked(projectsRetrieve).mockImplementation(missing as any);

    await expect(pruneMissingScope(scope())).resolves.toEqual({
      organization: ORG,
      project: null,
    });
  });

  it('accepts the bare status shape the SDK also throws', async () => {
    vi.mocked(customersRetrieve)
      .mockReset()
      .mockImplementation(() => Promise.reject({ status: 404 }) as any);

    await expect(pruneMissingScope(scope())).resolves.toEqual({
      organization: null,
      project: null,
    });
  });

  // A scope the user chose deliberately must survive a bad connection: absence
  // of an answer is not an answer.
  it.each([
    ['a server error', { response: { status: 500 } }],
    ['an expired session', { response: { status: 401 } }],
    ['a network failure', new TypeError('Failed to fetch')],
  ])('keeps the scope through %s', async (_label, error) => {
    vi.mocked(customersRetrieve).mockImplementation((() =>
      Promise.reject(error)) as any);
    vi.mocked(projectsRetrieve).mockImplementation((() =>
      Promise.reject(error)) as any);
    const current = scope();

    await expect(pruneMissingScope(current)).resolves.toBe(current);
  });

  it('checks only what is set', async () => {
    await pruneMissingScope(scope({ project: null }));

    expect(customersRetrieve).toHaveBeenCalledTimes(1);
    expect(projectsRetrieve).not.toHaveBeenCalled();
  });
});
