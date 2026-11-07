import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { useUser } from '@/workspace/hooks';

interface Grant {
  scope_type?: string;
  role_name?: string;
}

const REVIEWING_ROLES: string[] = [
  RoleEnum.CALL_REVIEWER,
  RoleEnum.CALL_PANEL_MEMBER,
];

/**
 * The name of the user's own call work. Reviewers and panel members review;
 * everyone else whose work lands there -- an offering manager assessing a
 * partition, an applicant answering a step -- has tasks, not reviews.
 */
export const getMyWorkTitle = (
  user: { permissions?: Grant[] } | null | undefined,
): string =>
  isReviewer(user) ? translate('My reviews') : translate('My tasks');

/** Whether the user reviews on some call: their call work has reviews,
 *  assignments and invitations besides the tasks waiting now. */
export const isReviewer = (
  user: { permissions?: Grant[] } | null | undefined,
): boolean =>
  Boolean(
    user?.permissions?.some(
      (grant) =>
        grant.scope_type === 'call' &&
        REVIEWING_ROLES.includes(grant.role_name),
    ),
  );

/** ``getMyWorkTitle`` for the current user: the heading of their call work. */
export const useMyWorkTitle = (): string => getMyWorkTitle(useUser());
