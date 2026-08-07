/** Longest a project name may be; mirrors structure.models.PROJECT_NAME_LENGTH. */
const PROJECT_NAME_LENGTH = 500;

interface CallLike {
  backend_id?: string | null;
  slug?: string | null;
}

interface RoundLike {
  start_time?: string | null;
}

/**
 * The project name a proposal will produce if it is accepted.
 *
 * Mirrors `allocate_proposal`, which joins the call prefix, the round's start
 * date and the proposal name with " - " and truncates the result. Shown under
 * the name field so the applicant can see what they are actually naming — the
 * proposal name is only the last third of it.
 *
 * Returns undefined when the pieces are not known, so the caller can fall back
 * to a plain description rather than render a misleading half-name.
 */
export const getProposalProjectName = (
  call: CallLike | undefined,
  round: RoundLike | undefined,
  proposalName: string,
): string | undefined => {
  const prefix = call?.backend_id || call?.slug;
  const startTime = round?.start_time;
  if (!prefix || !startTime || !proposalName) {
    return undefined;
  }
  // The backend formats with %Y-%m-%d; take the date part of the ISO string
  // rather than reformatting, so a timezone shift cannot move it a day.
  const date = startTime.slice(0, 10);
  return [prefix, date, proposalName].join(' - ').slice(0, PROJECT_NAME_LENGTH);
};
