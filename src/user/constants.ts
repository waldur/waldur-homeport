import { UserDetails } from '@waldur/workspace/types';

export const USER_PROFILE_COMPLETION_FIELDS: Array<keyof UserDetails> = [
  'first_name',
  'last_name',
  'email',
  'job_title',
  'organization',
  'phone_number',
];

export const USER_PERMISSION_REQUESTS_TABLE_ID =
  'user-permission-requests-table';
export const USER_PERMISSION_REQUESTS_FILTER_FORM_ID =
  'user-permission-requests-table-filter-form';
