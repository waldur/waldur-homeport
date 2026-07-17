import { describe, expect, it } from 'vitest';

import {
  getInferenceApiKey,
  getInferenceEndpoint,
  isInferenceServiceEnabled,
} from './inference';

describe('isInferenceServiceEnabled', () => {
  it('is true when the offering opted into the inference service view', () => {
    const resource = {
      offering_plugin_options: { expose_inference_playground: true },
    } as any;
    expect(isInferenceServiceEnabled(resource)).toBe(true);
  });

  it('is false when the flag is absent or off', () => {
    expect(isInferenceServiceEnabled({} as any)).toBe(false);
    expect(
      isInferenceServiceEnabled({
        offering_plugin_options: { expose_inference_playground: false },
      } as any),
    ).toBe(false);
  });
});

describe('getInferenceEndpoint', () => {
  it('returns the /v1 access endpoint with trailing slashes stripped', () => {
    const resource = {
      endpoints: [
        { name: 'dashboard', url: 'https://infer.example.ee/ui' },
        { name: 'api', url: 'https://infer.example.ee/v1/' },
      ],
    } as any;
    expect(getInferenceEndpoint(resource)).toBe('https://infer.example.ee/v1');
  });

  it('ignores non-/v1 endpoints and returns null when none match', () => {
    expect(
      getInferenceEndpoint({
        endpoints: [{ name: 'api', url: 'https://infer.example.ee/v1/chat' }],
      } as any),
    ).toBeNull();
    expect(getInferenceEndpoint({} as any)).toBeNull();
  });

  it('falls back to the offering endpoints when the resource has none', () => {
    const offering = {
      endpoints: [{ name: 'llm', url: 'https://llm.hpc.ut.ee/v1' }],
    } as any;
    expect(getInferenceEndpoint({} as any, offering)).toBe(
      'https://llm.hpc.ut.ee/v1',
    );
  });

  it('prefers the resource endpoint (which matches the api key) over the offering endpoint', () => {
    // The site-agent reports the endpoint and the key together, so the resource
    // endpoint is the gateway the key authenticates against — it must win.
    const resource = {
      endpoints: [{ name: 'OpenAI API', url: 'https://gateway.hpc.ut.ee/v1' }],
    } as any;
    const offering = {
      endpoints: [{ name: 'llm', url: 'https://shared.example.ee/v1' }],
    } as any;
    expect(getInferenceEndpoint(resource, offering)).toBe(
      'https://gateway.hpc.ut.ee/v1',
    );
  });
});

describe('getInferenceApiKey', () => {
  it('returns the api_key from backend_metadata when present', () => {
    expect(
      getInferenceApiKey({ backend_metadata: { api_key: 'sk-abc' } } as any),
    ).toBe('sk-abc');
  });

  it('returns null when the key is missing or empty', () => {
    expect(getInferenceApiKey({ backend_metadata: {} } as any)).toBeNull();
    expect(
      getInferenceApiKey({ backend_metadata: { api_key: '' } } as any),
    ).toBeNull();
    expect(getInferenceApiKey({} as any)).toBeNull();
  });
});
