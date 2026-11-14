import {
  memoryLocationPlugin,
  servicesPlugin,
  UIRouterReact,
} from '@uirouter/react';
import { describe, expect, it } from 'vitest';

import { states } from './routes';

const createRouter = () => {
  const router = new UIRouterReact();
  router.plugin(servicesPlugin);
  router.plugin(memoryLocationPlugin);
  states.forEach((state) => router.stateRegistry.register(state));
  return router;
};

const visit = async (router: UIRouterReact, url: string) => {
  router.urlService.url(url);
  router.urlService.sync();
  await router.globals.transition?.promise;
  return router.globals.params;
};

// The query exactly as mastermind's /oauth/authorize/ redirect builds it:
// Django's QueryDict.urlencode, which writes a space as "+".
const AUTHORIZE_REDIRECT =
  '/oauth/consent?client_id=abc&redirect_uri=http%3A%2F%2F127.0.0.1%3A33418%2Fcallback' +
  '&response_type=code&scope=mcp%3Aread+mcp%3Astaff&state=x%2By+z' +
  '&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256' +
  '&resource=https%3A%2F%2Fwaldur.example.com%2Fmcp&resource=https%3A%2F%2Fother.example.com%2Fmcp';

describe('oauth-consent route', () => {
  it('survives the login on a catalogue-only portal', () => {
    expect(states[0].data).toMatchObject({
      auth: true,
      keepThroughLogin: true,
    });
  });

  it('reads the authorize redirect with "+" as a space and every resource', async () => {
    const router = createRouter();
    const params = await visit(router, AUTHORIZE_REDIRECT);

    expect(router.globals.current.name).toBe('oauth-consent');
    expect(params).toMatchObject({
      client_id: 'abc',
      redirect_uri: 'http://127.0.0.1:33418/callback',
      response_type: 'code',
      scope: 'mcp:read mcp:staff',
      state: 'x+y z',
      code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
      code_challenge_method: 'S256',
      resource: [
        'https://waldur.example.com/mcp',
        'https://other.example.com/mcp',
      ],
    });
  });

  it('keeps a single resource as a list', async () => {
    const router = createRouter();
    const params = await visit(
      router,
      '/oauth/consent?client_id=abc&resource=https%3A%2F%2Fwaldur.example.com%2Fmcp',
    );

    expect(params.resource).toEqual(['https://waldur.example.com/mcp']);
  });

  it('builds a URL that reads back to the same values', async () => {
    // The login redirect stores the decoded params and navigates back with
    // them, so they must survive being written into a URL again.
    const values = {
      client_id: 'abc',
      scope: 'mcp:read mcp:staff',
      state: 'x+y z&w=%',
      resource: ['https://waldur.example.com/mcp?a=1&b=2'],
    };
    const router = createRouter();
    // The memory location prefixes hrefs with "#".
    const href = router.stateService
      .href('oauth-consent', values)
      .replace(/^#/, '');

    expect(href).toContain('scope=mcp%3Aread%20mcp%3Astaff');
    expect(href).toContain('state=x%2By%20z%26w%3D%25');

    const params = await visit(router, href);
    expect(params).toMatchObject(values);
  });

  it('passes a malformed escape on as sent', async () => {
    const router = createRouter();
    const params = await visit(
      router,
      '/oauth/consent?client_id=abc&state=%E0%A4%A',
    );

    expect(params.state).toBe('%E0%A4%A');
  });
});
