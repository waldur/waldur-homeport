import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

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

describe('InferenceServiceView', () => {
  beforeEach(() => vi.clearAllMocks());

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
});
