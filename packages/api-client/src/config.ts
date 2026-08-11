export interface ApiClientConfig {
  apiEndpoint: string;
}

let config: ApiClientConfig | undefined;

/**
 * Wires the shared request helpers to a host app's API origin. Call once
 * during bootstrap (and again whenever the value could change) before
 * relying on getIconUrl()/fixURL().
 */
export function configureApiClient(next: ApiClientConfig) {
  config = next;
}

export function getApiEndpoint(): string {
  if (!config) {
    throw new Error(
      'waldur-api-client: configureApiClient() must be called before making requests.',
    );
  }
  return config.apiEndpoint;
}
