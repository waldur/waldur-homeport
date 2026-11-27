import { describe, expect, it } from 'vitest';

import { siteAgentConfigUrl } from './AgentLoadsPanel';

describe('siteAgentConfigUrl', () => {
  const path = 'api/marketplace-provider-offerings/abc/site_agent_config/';

  it('is absolute when the API is served from the page origin', () => {
    expect(siteAgentConfigUrl('abc', '/', 'https://portal.example.com')).toBe(
      `https://portal.example.com/${path}`,
    );
  });

  it('keeps the host and path of a configured API endpoint', () => {
    expect(
      siteAgentConfigUrl(
        'abc',
        'https://api.example.com/waldur',
        'https://portal.example.com',
      ),
    ).toBe(`https://api.example.com/waldur/${path}`);
    expect(
      siteAgentConfigUrl(
        'abc',
        'http://localhost:8080/',
        'http://localhost:8001',
      ),
    ).toBe(`http://localhost:8080/${path}`);
  });
});
