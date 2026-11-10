/** Longest a project name may be; mirrors structure.models.PROJECT_NAME_LENGTH. */
const PROJECT_NAME_LENGTH = 500;

/** The call's name for a project when it sets no template; mirrors
 * DEFAULT_PROJECT_NAME_TEMPLATE in proposal/enums.py. */
export const DEFAULT_PROJECT_NAME_TEMPLATE =
  '{call_prefix} - {round_start} - {proposal_name}';

interface CallLike {
  backend_id?: string | null;
  slug?: string | null;
  name?: string | null;
  project_name_template?: string | null;
}

interface RoundLike {
  start_time?: string | null;
  slug?: string | null;
}

const PLACEHOLDER = /\{([^{}]*)\}/g;

/**
 * The project name a proposal will produce if it is accepted.
 *
 * Mirrors `allocation_names.allocated_project_name`: the call's
 * `project_name_template`, or `<call prefix> - <round start> - <name>`.
 * Shown under the name field so the applicant can see what they are actually
 * naming.
 *
 * Returns undefined when a piece is not known yet -- the round, the name, or
 * a placeholder only allocation can fill (the proposal's slug, the managing
 * organization's slug) -- so the caller can fall back to a plain description
 * rather than render a misleading half-name.
 */
export const getProposalProjectName = (
  call: CallLike | undefined,
  round: RoundLike | undefined,
  proposalName: string,
): string | undefined => {
  const startTime = round?.start_time;
  if (!call || !startTime || !proposalName) {
    return undefined;
  }
  // The backend formats with %Y-%m-%d; take the date part of the ISO string
  // rather than reformatting, so a timezone shift cannot move it a day.
  const values: Record<string, string | null | undefined> = {
    proposal_name: proposalName,
    call_prefix: call.backend_id || call.slug,
    call_slug: call.slug,
    call_name: call.name,
    round_start: startTime.slice(0, 10),
    round_slug: round.slug,
    year: String(new Date().getFullYear()),
  };
  const render = (template: string): string | undefined => {
    let complete = true;
    // One pass over the template: a brace inside a substituted value is never
    // read as a placeholder, as on the backend.
    const name = template.replace(PLACEHOLDER, (_, key: string) => {
      const value = values[key];
      if (!value) {
        complete = false;
        return '';
      }
      return value;
    });
    return complete ? name.trim() : undefined;
  };
  const custom = call.project_name_template?.trim()
    ? render(call.project_name_template)
    : undefined;
  if (call.project_name_template?.trim() && custom === undefined) {
    return undefined;
  }
  const name = custom || render(DEFAULT_PROJECT_NAME_TEMPLATE);
  return name?.slice(0, PROJECT_NAME_LENGTH);
};
