import { Offering, Resource } from 'waldur-js-client';

// Shared helpers for inference-service resources: offerings that opted into the
// "Enable inference service view" flag. The flag rides on the resource as
// offering_plugin_options.expose_inference_playground — the key is kept for
// backwards compatibility even though the feature outgrew the playground.

export const isInferenceServiceEnabled = (resource: Resource): boolean =>
  Boolean(
    (resource?.offering_plugin_options as any)?.expose_inference_playground,
  );

// The OpenAI-compatible base URL: a `/v1` access endpoint (trailing slashes
// ignored). Prefers the RESOURCE's own endpoint over the offering's: the
// site-agent reports the endpoint and the api_key together in one object
// (Envoy → `{gateway_url}/v1`, opennebula → the per-VM URL), so the resource
// endpoint is the exact gateway the key authenticates against. Offering
// endpoints are only a fallback for a resource that reported none.
export const getInferenceEndpoint = (
  resource: Resource,
  offering?: Offering,
): string | null => {
  const endpoints = [
    ...(resource?.endpoints ?? []),
    ...(offering?.endpoints ?? []),
  ];
  const match = endpoints.find(
    (endpoint: any) =>
      typeof endpoint?.url === 'string' &&
      endpoint.url.replace(/\/+$/, '').endsWith('/v1'),
  );
  return match ? match.url.replace(/\/+$/, '') : null;
};
