import { isEmpty } from 'lodash';

import { UserDetails } from '@waldur/workspace/types';

import { USER_PROFILE_COMPLETION_FIELDS } from '../constants';

export function calculateProfileCompletionPercentage(
  user: UserDetails,
  completionFields: Array<keyof UserDetails> = USER_PROFILE_COMPLETION_FIELDS,
) {
  let completionValue = 0;
  for (const key of completionFields) {
    if (!isEmpty(user[key])) completionValue++;
  }
  return Math.round((completionValue / completionFields.length) * 100);
}
