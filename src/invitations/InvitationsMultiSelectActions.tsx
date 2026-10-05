import { Invitation } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

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
    <Menu>
      <Menu.TriggerButton variant="primary">
        {translate('All actions')}
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        <MultiResendAction rows={rows} refetch={refetch} />
        <MultiCancelAction rows={rows} refetch={refetch} />
        {user.is_staff && <MultiDeleteAction rows={rows} refetch={refetch} />}
      </Menu.Content>
    </Menu>
  );
};
