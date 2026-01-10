import { Invitation } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionDropdownButton } from '@waldur/table/ActionDropdownButton';
import { useUser } from '@waldur/workspace/hooks';

import { MultiCancelAction } from './MultiCancelAction';
import { MultiDeleteAction } from './MultiDeleteAction';
import { MultiResendAction } from './MultiResendAction';

export const InvitationsMultiSelectActions = ({
  rows,
  refetch,
}: {
  rows: Invitation[];
  refetch(): void;
}) => {
  const user = useUser();
  return (
    <ActionDropdownButton variant="primary" title={translate('All actions')}>
      <MultiResendAction rows={rows} refetch={refetch} />
      <MultiCancelAction rows={rows} refetch={refetch} />
      {user.is_staff && <MultiDeleteAction rows={rows} refetch={refetch} />}
    </ActionDropdownButton>
  );
};
