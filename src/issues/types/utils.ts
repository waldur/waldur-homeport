import { User } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { SupportFeatures } from '@/FeaturesEnums';

import { IssueTypeChoice } from './constants';

export function getShowAllTypes(user: User) {
  return (
    !isFeatureVisible(SupportFeatures.conceal_change_request) ||
    user?.is_staff ||
    user?.is_support
  );
}

export function filterIssueTypes(
  issueTypes: IssueTypeChoice[],
  showAllTypes: boolean,
): IssueTypeChoice[] {
  return showAllTypes
    ? issueTypes
    : issueTypes.filter((x) => x.id !== 'Change Request');
}
