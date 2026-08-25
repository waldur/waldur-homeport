import { getStepDefinitions } from '@/proposals/workflow/constants';

export interface OfferViaCallFormData {
  name: string;
  cutoff_time: string;
  plan: { value: string; label: string };
  manager: { uuid: string; name: string };
  /** Enabled state per workflow step id. */
  steps: Record<string, boolean>;
}

/**
 * Which steps a new call may run.
 *
 * The award response is left out: the backend provisions it from the
 * allocation decision's own flag and refuses a direct write, so a checkbox
 * here would be a lie. The rest of the catalogue is offered because the same
 * choice is available in call configuration the moment this wizard closes —
 * making it here only saves the trip.
 */
export const selectableSteps = () =>
  getStepDefinitions().filter((definition) => !definition.managedByToggle);

/**
 * The workflow a new call starts from: only what it cannot do without.
 *
 * Every extra step is a stage somebody has to clear before the request can be
 * granted, and this action exists to make an offering requestable rather than
 * to build a review process — so the operator opts into those rather than out.
 */
export const defaultSteps = (): Record<string, boolean> =>
  Object.fromEntries(
    selectableSteps().map((definition) => [
      definition.id,
      definition.mandatory,
    ]),
  );

/** The enabled step ids, in the shape the offerViaCall chain expects. */
export const enabledStepIds = (steps: Record<string, boolean> = {}) =>
  Object.entries(steps)
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);
