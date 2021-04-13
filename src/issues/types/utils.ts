import { ENV } from '@waldur/configs/default';
import { ISSUE_IDS, getIssueTypeChoices } from '@waldur/issues/types/constants';
import { User } from '@waldur/workspace/types';

export function getShowAllTypes(user: User) {
  return !ENV.concealChangeRequest || user.is_staff || user.is_support;
}

export function getIssueTypes(showAllTypes: boolean) {
  return showAllTypes
    ? getIssueTypeChoices()
    : getIssueTypeChoices().filter((x) => x.id !== ISSUE_IDS.CHANGE_REQUEST);
}
