import { createContext, useContext } from 'react';

import { translate } from '@/i18n';

/** The key of the award response step (enums.AWARD_RESPONSE_KEY). */
const AWARD_RESPONSE_KEY = 'award_response';

/**
 * Whether a call is archived. Archiving closes the call's evaluation: its
 * configuration and its proposals' work up to the award stand still until
 * the call is activated again -- no evaluation step is completed, no review
 * submitted, no document attached. The award stage goes on: the award
 * response, provisioning, extensions and the final report. The backend
 * refuses what is frozen (409); the pages say so up front.
 */
export const isCallArchived = (call?: { state?: string } | null): boolean =>
  call?.state === 'archived';

/** Why a write action on a proposal of an archived call is disabled. */
export const getArchivedCallReason = () =>
  translate(
    'The call is archived: its evaluation is closed until the call is activated again.',
  );

/** What the notice of an archived call's proposal page says. */
export const getArchivedCallNoticeBody = () =>
  translate(
    'Its evaluation is closed until the call is activated again. The award stage continues: the award response, provisioning, extensions and the final report.',
  );

/**
 * Whether a step is award-stage work, which goes on in an archived call: a
 * step of an extension or of the closing, or the award response.
 */
export const isAwardStageStep = (
  step?: {
    phase?: string | null;
    /** The call step's key, as a step instance gives it. */
    step?: string | null;
    /** The call step's key, as a call step gives it. */
    key?: string | null;
  } | null,
): boolean =>
  step?.phase === 'extension' ||
  step?.phase === 'closing' ||
  // By key, as the backend tells the award response (archive.py).
  (step?.step ?? step?.key) === AWARD_RESPONSE_KEY;

/** ``reason`` unless ``step`` is award-stage work: for steps in a list. */
export const archivedReasonForStep = (
  reason: string | undefined,
  step?: Parameters<typeof isAwardStageStep>[0],
): string | undefined => (isAwardStageStep(step) ? undefined : reason);

/**
 * Whether a row of an API list -- a proposal, a review, an assignment batch,
 * an evaluator role -- belongs to an archived call, by its `call_state`.
 */
// Any row: `call_state` is read where the API gives it, and a row without
// it (an older backend) counts as not archived.
export const isRowOfArchivedCall = (row?: object | null): boolean =>
  (row as { call_state?: string | null } | null | undefined)?.call_state ===
  'archived';

/**
 * Whether the proposal on screen belongs to an archived call. Set by the
 * pages that know the call (the proposal page, the review page, the call's
 * proposal list); the action controls read it through useArchivedCallReason.
 */
export const ArchivedCallContext = createContext<boolean>(false);

/**
 * The tooltip of a write action disabled because its call is archived, or
 * undefined while the call is not -- or while ``step``, the step the action
 * is on, is award-stage work, which goes on. Use it as both `disabled={!!reason}` and
 * `disabledReason={reason}`.
 */
export const useArchivedCallReason = (
  step?: Parameters<typeof isAwardStageStep>[0],
): string | undefined =>
  archivedReasonForStep(
    useContext(ArchivedCallContext) ? getArchivedCallReason() : undefined,
    step,
  );
