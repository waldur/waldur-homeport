import { FC } from 'react';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const MY_INVITATIONS_FILTER_FORM_ID = 'MyInvitationsFilter';

const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: translate('Pending') },
  { value: 'accepted', label: translate('Accepted') },
  { value: 'declined', label: translate('Declined') },
  { value: 'expired', label: translate('Expired') },
];

export const MyInvitationsFilter: FC = () => (
  <SelectFilter
    title={translate('Status')}
    name="invitation_status"
    placeholder={translate('All statuses')}
    options={INVITATION_STATUS_OPTIONS}
    isClearable
  />
);
