import { GroupInviteRow } from './types';

/**
 * What the Continue check says about an (email, role) pair: a pending
 * invitation, or a role the invitee already holds. `projectUuid` is the
 * project the pair was checked in when the role is project-scoped; other
 * scopes are fixed for the whole dialog, so email and role identify the row.
 */
export interface RowVerdict {
  email?: string;
  roleUuid?: string;
  projectUuid?: string;
}

type VerdictRow = Pick<GroupInviteRow, 'email'> & {
  role_project?: {
    role?: Pick<GroupInviteRow['role_project']['role'], 'uuid'>;
    project?: Pick<GroupInviteRow['role_project']['project'], 'uuid'>;
  } | null;
};

/**
 * Whether a verdict still describes the row as it is now. Matching on the
 * project as well means that moving a row to another project drops a verdict
 * recorded for the old one, instead of leaving the row blocked by it.
 */
export const isVerdictForRow = (
  verdict: RowVerdict,
  row: VerdictRow | undefined,
): boolean =>
  Boolean(row?.email) &&
  verdict.email === row.email &&
  verdict.roleUuid === row.role_project?.role?.uuid &&
  (!verdict.projectUuid ||
    verdict.projectUuid === row.role_project?.project?.uuid);

export const findVerdictForRow = <T extends RowVerdict>(
  verdicts: T[] | '' | undefined,
  row: VerdictRow | undefined,
): T | undefined =>
  Array.isArray(verdicts)
    ? verdicts.find((verdict) => isVerdictForRow(verdict, row))
    : undefined;
