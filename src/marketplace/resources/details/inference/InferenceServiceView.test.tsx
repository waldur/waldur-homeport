import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

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
  InferencePlayground: ({ endpoint, height }: any) => (
    <div
      data-testid="playground"
      data-endpoint={endpoint}
      data-height={height}
    />
  ),
}));
vi.mock('../../playground/ModelSelect', () => ({
  ModelSelect: () => <div data-testid="model-select" />,
}));

const OFFERING = { customer_uuid: 'cust-1' } as any;

const makeResource = () =>
  ({
    offering_plugin_options: { expose_inference_playground: true },
    endpoints: [{ name: 'api', url: 'https://reported.example/v1' }],
    backend_metadata: { api_key: 'sk-reported' },
  }) as any;

const makeResourceNoEndpoint = () =>
  ({
    offering_plugin_options: { expose_inference_playground: true },
    endpoints: [],
    backend_metadata: {},
  }) as any;

const renderView = (resource = makeResource()) =>
  renderWithProviders(
    <InferenceServiceView resource={resource} offering={OFFERING} />,
  );

describe('InferenceServiceView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the reported endpoint and the playground', () => {
    renderView();
    expect(screen.getByText('https://reported.example/v1')).toBeInTheDocument();
    expect(screen.getByText('Playground')).toBeInTheDocument();
  });

  it('shows an empty state without a CTA when no endpoint is reported', () => {
    renderView(makeResourceNoEndpoint());
    expect(screen.getByText('No inference endpoint')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /endpoint/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('playground')).not.toBeInTheDocument();
  });

  it('keeps the playground collapsed until opened', async () => {
    const user = userEvent.setup();
    renderView();

    // Collapsed: only the title + open control, no playground body.
    expect(screen.queryByTestId('playground')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open playground' }));

    expect(screen.getByTestId('playground')).toHaveAttribute(
      'data-endpoint',
      'https://reported.example/v1',
    );
  });
});
