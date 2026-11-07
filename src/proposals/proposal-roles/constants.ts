import { translate } from '@/i18n';

/** Who may hold an evaluator role, as the backend's `eligible_from`. */
export type ProposalRoleEligibility =
  | 'call_role:manager'
  | 'call_role:reviewer'
  | 'call_role:panel_member'
  | 'proposal_reviewers'
  | 'any_user'
  | 'panel:chair'
  | 'panel:member';

export const PROPOSAL_ROLE_ELIGIBILITY_OPTIONS: ProposalRoleEligibility[] = [
  'call_role:panel_member',
  'panel:member',
  'panel:chair',
  'call_role:reviewer',
  'call_role:manager',
  'proposal_reviewers',
  'any_user',
];

export const eligibilityLabel = (value: string | null | undefined): string => {
  switch (value) {
    case 'call_role:panel_member':
      return translate('Panel members of the call');
    case 'call_role:reviewer':
      return translate('Reviewers of the call');
    case 'call_role:manager':
      return translate('Call managers of the call');
    case 'proposal_reviewers':
      return translate('Reviewers who submitted a review of the proposal');
    case 'any_user':
      return translate('Any user');
    case 'panel:chair':
      return translate("The chair of the proposal's panel");
    case 'panel:member':
      return translate("Members of the proposal's panel");
    default:
      return '—';
  }
};

/**
 * How many people hold the role on one proposal: "2", "1–3", "at least 1".
 */
export const holdersLabel = (role: {
  min_holders?: number;
  max_holders?: number | null;
}): string => {
  const min = role.min_holders ?? 1;
  const max = role.max_holders;
  if (max == null) {
    return translate('At least {min}', { min });
  }
  return min === max ? String(max) : `${min}–${max}`;
};

/** The state of a holder's conflict-of-interest confirmation. */
export const coiStateLabel = (assignment: {
  coi_confirmation_required?: boolean;
  coi_confirmed_at?: string | null;
  coi_declaration_only?: boolean;
  has_standing_conflict?: boolean | null;
}): string => {
  // A conflict recorded since stops the role's access, confirmed or not.
  if (assignment.has_standing_conflict) {
    return translate('Conflict recorded: no access');
  }
  if (assignment.coi_confirmation_required && !assignment.coi_confirmed_at) {
    return translate('Awaiting confirmation');
  }
  if (assignment.coi_confirmed_at) {
    return assignment.coi_declaration_only
      ? translate('Confirmed by declaration')
      : translate('Confirmed');
  }
  return assignment.coi_declaration_only
    ? translate('No reviewer profile to check')
    : translate('No conflict on record');
};

/**
 * The evaluator roles some enabled step of the call needs: one it assigns,
 * takes contributions from, or has completed by the role's holders. A role
 * no such step names is the call's vocabulary only, and asks nobody to be
 * assigned.
 */
export const rolesUsedBySteps = (
  steps: Array<{
    is_enabled?: boolean;
    assigns_roles?: string[];
    contributor_proposal_role_uuid?: string | null;
    completer_proposal_role?: string | null;
  }>,
): Set<string> => {
  const used = new Set<string>();
  const add = (uuid: string | null | undefined) => {
    if (uuid) used.add(uuid.replace(/-/g, ''));
  };
  for (const step of steps) {
    if (step.is_enabled === false) continue;
    (step.assigns_roles ?? []).forEach(add);
    add(step.contributor_proposal_role_uuid);
    add(step.completer_proposal_role);
  }
  return used;
};

export const isRoleUsed = (used: Set<string>, role: { uuid: string }) =>
  used.has(role.uuid.replace(/-/g, ''));

/**
 * What an empty list of candidates for a role means: the call has nobody in
 * the call role the evaluator role is picked from.
 */
export const emptyPoolMessage = (
  eligibleFrom: string | null | undefined,
): string | undefined => {
  switch (eligibleFrom) {
    case 'call_role:panel_member':
      return translate(
        'The call has no panel members — add them in the Team tab.',
      );
    case 'call_role:reviewer':
      return translate('The call has no reviewers — add them in the Team tab.');
    case 'call_role:manager':
      return translate(
        'The call has no call managers — add them in the Team tab.',
      );
    case 'proposal_reviewers':
      return translate(
        'No reviewer has submitted a review of this proposal yet.',
      );
    case 'panel:chair':
    case 'panel:member':
      return translate(
        "The proposal's panel has nobody able to take this role — check the proposal's panel and that panel's members in the Panels tab.",
      );
    default:
      return undefined;
  }
};

/**
 * A holder's conflict-of-interest state as those overseeing the proposal
 * read it, with what to do: a holder yet to confirm only has to confirm; one
 * with a conflict on record is to be replaced.
 */
export const coiStateForOverseers = (assignment: {
  coi_confirmation_required?: boolean;
  coi_confirmed_at?: string | null;
  coi_declaration_only?: boolean;
  has_standing_conflict?: boolean | null;
}): string => {
  if (assignment.has_standing_conflict) {
    return translate('Conflict of interest recorded: replace the holder');
  }
  if (assignment.coi_confirmation_required && !assignment.coi_confirmed_at) {
    return translate('Has not yet confirmed having no conflict of interest');
  }
  return coiStateLabel(assignment);
};
