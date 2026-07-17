import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderResourcesRetrieve } from 'waldur-js-client';

import { createTestQueryClient, renderWithProviders } from '@/test/harness';

import {
  EditResourceMetadataDialog,
  EditResourceMetadataForm,
  resourceToMetadataForm,
  toEndpointsBody,
  toMetadataBody,
} from './EditResourceMetadataDialog';

// waldur-js-client is auto-mocked globally (test/mocks/modal.js); give the
// retrieve a fresh endpoint URL per call so a reopen (second fetch) is
// distinguishable from a stale cache hit.
const retrieve = { calls: 0 };
const stubRetrieve = () =>
  vi.mocked(marketplaceProviderResourcesRetrieve).mockImplementation((() => {
    retrieve.calls += 1;
    return Promise.resolve({
      data: {
        uuid: 'r1',
        endpoints: [
          { name: 'api', url: `https://v${retrieve.calls}.example/v1` },
        ],
        backend_metadata: {},
      },
    });
  }) as any);

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ children }: any) => <div>{children}</div>,
}));

// Capture the initialValues (and its endpoint URL) handed to the form on each
// render so we can assert both reference stability and freshness on reopen.
const seededInitialValues: any[] = [];
vi.mock('@/resource/actions/ResourceActionDialog', () => ({
  ResourceActionDialog: ({ initialValues }: any) => {
    seededInitialValues.push(initialValues);
    return <div data-testid="metadata-form" />;
  },
}));

const lastEndpointUrl = () =>
  seededInitialValues[seededInitialValues.length - 1]?.endpoints[0]?.url;

afterEach(() => {
  seededInitialValues.length = 0;
  retrieve.calls = 0;
  vi.clearAllMocks();
});

describe('resourceToMetadataForm', () => {
  it('maps endpoints and string metadata into editable rows', () => {
    const resource = {
      endpoints: [{ uuid: 'e1', name: 'api', url: 'https://x.example/v1' }],
      backend_metadata: { api_key: 'sk-1' },
    };
    expect(resourceToMetadataForm(resource)).toEqual({
      endpoints: [{ name: 'api', url: 'https://x.example/v1' }],
      metadata: [{ key: 'api_key', value: 'sk-1' }],
    });
  });

  it('renders nested metadata values as JSON text', () => {
    const resource = {
      endpoints: [],
      backend_metadata: { state: { phase: 'ok' } },
    };
    expect(resourceToMetadataForm(resource).metadata).toEqual([
      { key: 'state', value: '{"phase":"ok"}' },
    ]);
  });

  it('tolerates a resource with no endpoints or metadata', () => {
    expect(resourceToMetadataForm({})).toEqual({ endpoints: [], metadata: [] });
  });
});

describe('toEndpointsBody', () => {
  it('strips rows to name + url for set_endpoints', () => {
    expect(
      toEndpointsBody([
        { name: 'api', url: 'https://x/v1', extra: 'drop' } as any,
      ]),
    ).toEqual([{ name: 'api', url: 'https://x/v1' }]);
  });

  it('defaults to an empty list', () => {
    expect(toEndpointsBody()).toEqual([]);
  });
});

describe('toMetadataBody', () => {
  it('rebuilds the object from key/value rows', () => {
    expect(
      toMetadataBody([
        { key: 'api_key', value: 'sk-1' },
        { key: 'client_id', value: 'c-1' },
      ]),
    ).toEqual({ api_key: 'sk-1', client_id: 'c-1' });
  });

  it('coerces a missing value to an empty string', () => {
    expect(toMetadataBody([{ key: 'k', value: undefined as any }])).toEqual({
      k: '',
    });
  });
});

describe('EditResourceMetadataForm', () => {
  // Regression: a background refetch re-renders the form with a fresh resource
  // object. If we rebuild initialValues each time, react-final-form reinitializes
  // and the row being edited flashes back to its original value. initialValues
  // must keep the same reference across renders of the same resource.
  it('keeps initialValues stable when the resource refetches', () => {
    const makeResource = () => ({
      uuid: 'r1',
      endpoints: [{ name: 'api', url: 'https://x.example/v1' }],
      backend_metadata: { api_key: 'sk-1' },
    });

    const { rerender } = render(
      <EditResourceMetadataForm resource={makeResource()} />,
    );
    // Simulate the refetch handing down a brand-new object with the same uuid.
    rerender(<EditResourceMetadataForm resource={makeResource()} />);

    expect(seededInitialValues.length).toBeGreaterThanOrEqual(2);
    expect(seededInitialValues[0]).toBe(
      seededInitialValues[seededInitialValues.length - 1],
    );
  });
});

describe('EditResourceMetadataDialog', () => {
  // Regression: after saving, reopening the dialog must show the freshly saved
  // data, not the pre-edit copy react-query cached from the first open.
  it('refetches fresh data when reopened', async () => {
    stubRetrieve();
    // One client shared across both opens, mirroring the app-level cache.
    const queryClient = createTestQueryClient();
    const resolve = { resource: { uuid: 'r1' } as any, refetch: vi.fn() };

    const first = renderWithProviders(
      <EditResourceMetadataDialog resolve={resolve} />,
      { queryClient },
    );
    await waitFor(() =>
      expect(lastEndpointUrl()).toBe('https://v1.example/v1'),
    );
    // Closing the dialog drops the last observer.
    first.unmount();

    renderWithProviders(<EditResourceMetadataDialog resolve={resolve} />, {
      queryClient,
    });
    await waitFor(() =>
      expect(lastEndpointUrl()).toBe('https://v2.example/v1'),
    );
    expect(retrieve.calls).toBe(2);
  });
});
