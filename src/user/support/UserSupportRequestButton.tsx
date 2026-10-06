import { ChatCircleTextIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useStaffRequest } from '@/issues/staff-request/useStaffRequest';
import { ActionItem } from '@/resource/actions/ActionItem';

export const UserSupportRequestButton: FunctionComponent<{ row }> = ({
  row,
}) => {
  const { canOpen, open } = useStaffRequest(row);

  if (!canOpen) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Open support request')}
      action={open}
      iconNode={<ChatCircleTextIcon weight="bold" />}
      disabled={!row.is_active}
      tooltip={
        !row.is_active &&
        translate('A deactivated user cannot see or answer a request.')
      }
      staff
      size="sm"
    />
  );
};
