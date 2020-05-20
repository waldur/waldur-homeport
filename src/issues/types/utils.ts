import { ENV } from '@waldur/core/services';
import { ISSUE_IDS, ISSUE_TYPE_CHOICES } from '@waldur/issues/types/constants';
import { User } from '@waldur/workspace/types';

export function getShowAllTypes(user: User) {
  return !ENV.concealChangeRequest || user.is_staff || user.is_support;
}

export function getIssueTypes(showAllTypes: boolean) {
  return showAllTypes
    ? ISSUE_TYPE_CHOICES
    : ISSUE_TYPE_CHOICES.filter(x => x.id !== ISSUE_IDS.CHANGE_REQUEST);
}
