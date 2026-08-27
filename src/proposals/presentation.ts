import { translate } from '@/i18n';
import {
  hasCallVocabulary,
  isCallsSectionVisible,
} from '@/marketplace/serviceAccessMode';

/**
 * How the applicant's request is presented.
 *
 * One question decides all of it: does this deployment present itself as
 * running calls for proposals? `SERVICE_ACCESS_MODE = marketplace` says no —
 * the applicant arrives from an offering, never navigates to a call, and has
 * no calls section — so the request drops everything that only makes sense
 * inside a call, and is named accordingly.
 *
 * Every component in the request view asks this module rather than reading the
 * mode directly, so the whole policy is one file to review. The marketplace
 * entry dialogs consult it too: they present proposal concepts (a round
 * deadline, a call name) and must agree with the pages they lead to.
 *
 * The helpers below are deliberately separate rather than one `isMarketplace`
 * predicate: at the call site `showsProposalDuration()` says *why* a field is
 * hidden where a mode check would not, and if these ever need to diverge, this
 * is the only file that changes.
 */

/**
 * Whether this UI may name calls, rounds and the objects around them.
 *
 * Not configurable per component: a deployment that hides calls from
 * applicants hides the word everywhere, or the applicant meets it in one place
 * and not another.
 *
 * A re-export of `hasCallVocabulary` rather than a call site importing it
 * directly, so every question the request view asks about its own presentation
 * arrives here and the access mode stays behind one door. The name matches the
 * thing it delegates to: they are the same predicate, and reading one as a
 * different concept from the other is the confusion worth avoiding.
 */
export const usesCallVocabulary = (): boolean => hasCallVocabulary();

/**
 * Call name and round reference on the overview card, the Call and Round tabs
 * in the details dialog, and the empty-state copy that tells an applicant to
 * ask the call manager.
 */
export const showsCallContext = (): boolean => usesCallVocabulary();

/**
 * Project duration in days — the input, its required-field entry, the
 * read-only summary row and the list column, as one unit.
 *
 * Nothing downstream reads the value: allocation takes each resource
 * request's own end date, and the proposal-level duration reaches only the
 * state-change notification. It is a question a call asks, not one the
 * marketplace needs answered.
 */
export const showsProposalDuration = (): boolean => usesCallVocabulary();

/**
 * The per-step evaluation tracker, rather than the coarse
 * Submission -> Review -> Decision one.
 *
 * ANDed with each step's own `applicant_visible`, never ORed: that flag is the
 * call manager's decision about their own process, so this may hide further
 * but must never reveal a step a call marked invisible.
 */
export const showsWorkflowSteps = (): boolean => usesCallVocabulary();

/** The Call column in the tracking lists. */
export const showsCallColumns = (): boolean => usesCallVocabulary();

/**
 * What the object is called.
 *
 * "Access request" rather than plain "request": `profile.resource-requests`
 * already owns that word for the individual asks *inside* one, and two
 * adjacent pages of "requests" at different granularities would not be
 * distinguishable.
 *
 * Getters, not constants: translate() must run at render time, after the
 * locale dictionary has loaded.
 */
export const requestNoun = (): string =>
  usesCallVocabulary() ? translate('Proposal') : translate('Access request');

export const requestNounPlural = (): string =>
  usesCallVocabulary() ? translate('Proposals') : translate('Access requests');

/**
 * The applicant's own list of requests — the page title, the breadcrumb, and
 * the back link out of a single request.
 *
 * Shared rather than branched at each site so the three cannot drift: a back
 * link promising one destination and a page titled another is worse than
 * either wording on its own.
 */
export const requestListTitle = (): string =>
  usesCallVocabulary()
    ? translate('My proposals')
    : translate('My access requests');

/**
 * Where that list lives.
 *
 * Two routes render it. `proposals-all-proposals` sits under the calls
 * section, which marketplace-only mode does not show, so there the list is
 * reached through the profile instead — and `profile.proposals` is permitted
 * on exactly the inverse condition (see user/routes.ts). Anything navigating
 * to the list must ask here rather than pick one, or it lands an applicant on
 * a route their deployment refuses to resolve.
 */
export const requestListState = (): string =>
  isCallsSectionVisible() ? 'proposals-all-proposals' : 'profile.proposals';
