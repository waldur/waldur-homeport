import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listInferenceModels } from './streamChat';
import { useInferenceModels } from './useInferenceModels';

vi.mock('./streamChat', () => ({ listInferenceModels: vi.fn() }));

describe('useInferenceModels', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears the stale model list when the endpoint switches to one that fails', async () => {
    vi.mocked(listInferenceModels).mockResolvedValueOnce([
      'nemotron-3-super-120b',
    ]);
    const { result, rerender } = renderHook(
      ({ endpoint, apiKey }) => useInferenceModels(endpoint, apiKey),
      {
        initialProps: {
          endpoint: 'https://good.example/v1',
          apiKey: 'sk-good',
        },
      },
    );

    await waitFor(() =>
      expect(result.current.models).toEqual(['nemotron-3-super-120b']),
    );
    expect(result.current.model).toBe('nemotron-3-super-120b');

    // Override to a bad endpoint whose /models call is rejected (401).
    vi.mocked(listInferenceModels).mockRejectedValueOnce(
      new Error('The endpoint rejected the API key (401).'),
    );
    rerender({ endpoint: 'https://bad.example/v1', apiKey: 'sk-bad' });

    await waitFor(() =>
      expect(result.current.error).toBe(
        'The endpoint rejected the API key (401).',
      ),
    );
    // The dead endpoint must not leave the previous endpoint's model selectable.
    expect(result.current.models).toEqual([]);
    expect(result.current.model).toBe('');
  });
});
