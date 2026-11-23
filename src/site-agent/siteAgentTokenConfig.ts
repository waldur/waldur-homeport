import { ENV } from '@/core/config';

interface SiteAgentTokenConfigOptions {
  token: string;
  apiUrl: string;
  offering: { uuid: string; name: string };
}

/**
 * The API's absolute URL. ENV.apiEndpoint is relative ("" or "/") when the
 * API is served from the frontend's own host, and a site agent or a curl
 * command run elsewhere cannot use a relative URL.
 */
export const getAbsoluteApiUrl = (): string =>
  new URL(`${ENV.apiEndpoint}api/`, window.location.origin).href;

// JSON strings are valid YAML double-quoted scalars, so names with colons or
// quotes stay intact.
const quote = (value: string) => JSON.stringify(value);

/**
 * The connection part of a waldur-site-agent configuration for a new token.
 * Backend settings and components come from "Generate Site Agent Config";
 * this fills in what only the token's creator knows.
 */
export const buildSiteAgentTokenConfig = ({
  token,
  apiUrl,
  offering,
}: SiteAgentTokenConfigOptions): string =>
  [
    '# Waldur Site Agent: connection settings for this offering.',
    '# Add backend_settings and backend_components from',
    '# "Generate Site Agent Config" in the offering\'s integration settings.',
    'offerings:',
    `  - name: ${quote(offering.name)}`,
    `    waldur_api_url: ${quote(apiUrl)}`,
    `    waldur_api_token: ${quote(token)}`,
    `    waldur_offering_uuid: ${quote(offering.uuid)}`,
    '',
  ].join('\n');
