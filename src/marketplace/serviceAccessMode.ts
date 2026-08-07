import { ServiceAccessMode } from '@/auth/types';
import { ENV } from '@/core/config';

/**
 * How a user reaches services in this deployment.
 *
 * Replaces the combination of `call_only`, `show_proposal_requests` and the
 * implicit "no calls menu" state that used to encode this across several
 * booleans. Navigation only — every mode is served the same API.
 *
 * Defaults to 'both', matching the backend, so a deployment that has not been
 * migrated yet keeps showing everything rather than hiding a section.
 */
export const getServiceAccessMode = (): ServiceAccessMode =>
  ENV.plugins?.WALDUR_CORE?.SERVICE_ACCESS_MODE || 'both';

/** The marketplace is browsable in its own right. */
export const isMarketplaceVisible = () => getServiceAccessMode() !== 'calls';

/** Calls are browsable as their own section, rather than only through offerings. */
export const isCallsSectionVisible = () =>
  getServiceAccessMode() !== 'marketplace';

/**
 * Whether an offering can be applied for through a call.
 *
 * True unless calls are the only way in, where there is no offering page to
 * apply from in the first place.
 */
export const isProposalRequestEnabled = () =>
  getServiceAccessMode() !== 'calls';

/**
 * Whether the applicant-facing request flow may name calls, rounds and proposals.
 *
 * In marketplace-only mode it may not: the applicant arrives from an offering,
 * never navigates to a call, and sees no calls section — so those words name
 * nothing they can point at. Everywhere else the terms are the domain's own and
 * appear throughout the UI, so using anything else would be the odd one out.
 *
 * Deliberately narrow. It governs the request dialogs, not the product: the
 * operator surface, the roles and the API keep the call vocabulary in every
 * mode, because those are the objects being managed.
 */
export const hasCallVocabulary = () => getServiceAccessMode() !== 'marketplace';
