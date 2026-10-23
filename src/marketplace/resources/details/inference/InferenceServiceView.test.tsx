import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import {
  useResourceApiKeysTable,
  useRevealedApiKey,
} from '../api-keys/useResourceApiKeys';

import { InferenceServiceView } from './InferenceServiceView';

vi.mock('../../playground/useInferenceModels', () => ({
  useInferenceModels: vi.fn(() => ({
    models: [],
    model: '',
    setModel: vi.fn(),
    error: null,
  })),
}));
vi.mock('../../playground/InferencePlayground', () => ({
  InferencePlayground: ({ endpoint, apiKey }: any) => (
    <div
      data-testid="playground"
      data-endpoint={endpoint}
      data-api-key={apiKey ?? ''}
    />
  ),
}));
vi.mock('../../playground/ModelSelect', () => ({
  ModelSelect: () => <div data-testid="model-select" />,
}));
vi.mock('../api-keys/useResourceApiKeys', () => ({
  useResourceApiKeysTable: vi.fn(),
  useRevealedApiKey: vi.fn(),
}));

const OFFERING = { customer_uuid: 'cust-1' } as any;

const makeResource = (
  endpoints = [{ name: 'api', url: 'https://x.example/v1' }],
) =>
  ({
    uuid: 'res-1',
    project_uuid: 'proj-1',
    customer_uuid: 'cust-1',
    offering_plugin_options: { expose_inference_playground: true },
    endpoints,
  }) as any;

// The view fetches the keys only to pick the one the playground authenticates
// with; managing them is the API keys tab's job.
const setup = ({ keys = [], revealValue = null } = {}) => {
  const reveal = vi.fn().mockResolvedValue(revealValue);
  vi.mocked(useResourceApiKeysTable).mockReturnValue({
    rows: keys,
    fetch: vi.fn(),
  } as any);
  vi.mocked(useRevealedApiKey).mockReturnValue({
    value: revealValue,
    revealing: false,
    reveal,
  });
  return { reveal };
};

// Reveal needs a role on the resource's project or organization.
const MEMBER = {
  uuid: 'me',
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: 'proj-1',
      role_name: 'PROJECT.MEMBER',
    },
  ],
};

describe('InferenceServiceView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue(MEMBER as any);
  });

  it('renders the endpoint and playground, leaving keys to their own tab', () => {
    setup();
    renderWithProviders(
      <InferenceServiceView resource={makeResource()} offering={OFFERING} />,
    );
    expect(screen.getByText('https://x.example/v1')).toBeInTheDocument();
    expect(screen.getByText('Playground')).toBeInTheDocument();
    // Keys have exactly one home — the API keys tab — so this view must not
    // render a second copy of the table.
    expect(screen.queryByText('API keys')).not.toBeInTheDocument();
  });

  it('shows an empty state when no endpoint is reported', () => {
    setup();
    renderWithProviders(
      <InferenceServiceView resource={makeResource([])} offering={OFFERING} />,
    );
    expect(screen.getByText('No inference endpoint')).toBeInTheDocument();
    expect(screen.queryByTestId('playground')).not.toBeInTheDocument();
  });

  it('reveals the first active key when the playground opens', async () => {
    const user = userEvent.setup();
    const { reveal } = setup({
      keys: [{ uuid: 'k1', state: 'OK', fingerprint: 'sk-a...b' }] as any,
    });
    renderWithProviders(
      <InferenceServiceView resource={makeResource()} offering={OFFERING} />,
    );

    expect(screen.queryByTestId('playground')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open playground' }));

    expect(screen.getByTestId('playground')).toBeInTheDocument();
    expect(reveal).toHaveBeenCalledTimes(1);
  });

  describe('picking the playground key', () => {
    const OTHERS = { uuid: 'k1', state: 'OK', user_uuid: 'someone-else' };
    const SHARED = { uuid: 'k2', state: 'OK', user_uuid: null };

    const renderWith = (keys: any[], user: any) => {
      vi.mocked(useUser).mockReturnValue(user);
      setup({ keys } as any);
      renderWithProviders(
        <InferenceServiceView resource={makeResource()} offering={OFFERING} />,
      );
    };

    // Reveal refuses another user's personal key, which would leave the
    // playground unable to authenticate.
    it('skips a key assigned to someone else for a shared one', () => {
      renderWith([OTHERS, SHARED], MEMBER);
      expect(useRevealedApiKey).toHaveBeenCalledWith('k2');
    });

    it("picks no key when every active key is someone else's", () => {
      renderWith([OTHERS], MEMBER);
      expect(useRevealedApiKey).toHaveBeenCalledWith('');
    });

    // Reveal holds staff and support to the same rules as members.
    it("gives staff and support no one else's key", () => {
      for (const role of [{ is_staff: true }, { is_support: true }]) {
        vi.mocked(useRevealedApiKey).mockClear();
        renderWith([OTHERS], { ...MEMBER, ...role });
        expect(useRevealedApiKey).toHaveBeenCalledWith('');
      }
    });

    it('picks no key for staff and support outside the project', () => {
      for (const role of [{ is_staff: true }, { is_support: true }]) {
        vi.mocked(useRevealedApiKey).mockClear();
        renderWith([SHARED], { ...MEMBER, ...role, permissions: [] });
        expect(useRevealedApiKey).toHaveBeenCalledWith('');
      }
    });
  });
});
