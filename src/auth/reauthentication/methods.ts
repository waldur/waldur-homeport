import type { ReauthenticationChallenge } from 'waldur-auth-core';

// The methods this portal can confirm the user's identity with. The API may
// offer others (an identity provider's round trip); an account offered only
// those cannot confirm it is them here, and is pointed to support.
const SUPPORTED_METHODS = ['password', 'passkey'];

export const canConfirmHere = (challenge: ReauthenticationChallenge) =>
  challenge.methods.some((method) => SUPPORTED_METHODS.includes(method));
