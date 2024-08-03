import { DropdownButton } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { MultiCancelAction } from './MultiCancelAction';
import { MultiDeleteAction } from './MultiDeleteAction';
import { MultiResendAction } from './MultiResendAction';
import { Invitation } from './types';

export const InvitationsMultiSelectActions = ({
  rows,
  refetch,
}: {
  rows: Invitation[];
  refetch(): void;
}) => {
  const user = useSelector(getUser);
  return (
    <DropdownButton variant="primary" title={translate('All actions')}>
      <MultiResendAction rows={rows} refetch={refetch} />
      <MultiCancelAction rows={rows} refetch={refetch} />
      {user.is_staff && <MultiDeleteAction rows={rows} refetch={refetch} />}
    </DropdownButton>
  );
};
