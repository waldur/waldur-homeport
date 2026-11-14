import { lazyComponent } from '@/core/lazyComponent';
import { StateDeclaration } from '@/core/types';

import { formEncodedParam } from './formEncodedParam';

export const states: StateDeclaration[] = [
  {
    // Not `home.oauth-consent`: a `home.` name reads as a sign-in step, and the
    // login redirect would drop the page and its parameters. No parent either,
    // so the page draws its own frame instead of the app layout.
    name: 'oauth-consent',
    url: '/oauth/consent?client_id&redirect_uri&response_type&scope&state&code_challenge&code_challenge_method&resource',
    component: lazyComponent(() =>
      import('./OAuthConsentPage').then((module) => ({
        default: module.OAuthConsentPage,
      })),
    ),
    params: {
      client_id: { type: formEncodedParam },
      redirect_uri: { type: formEncodedParam },
      response_type: { type: formEncodedParam },
      scope: { type: formEncodedParam },
      state: { type: formEncodedParam },
      code_challenge: { type: formEncodedParam },
      code_challenge_method: { type: formEncodedParam },
      // RFC 8707 lets a client name several resources.
      resource: { type: formEncodedParam, array: true },
    },
    data: {
      auth: true,
      // The client's request has to survive the login.
      keepThroughLogin: true,
    },
  },
];
