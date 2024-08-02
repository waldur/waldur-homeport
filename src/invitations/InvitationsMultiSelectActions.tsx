import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { MultiCancelAction } from './MultiCancelAction';
import { MultiResendAction } from './MultiResendAction';
import { Invitation } from './types';

export const InvitationsMultiSelectActions = ({
  rows,
  refetch,
}: {
  rows: Invitation[];
  refetch(): void;
}) => (
  <DropdownButton variant="primary" title={translate('All actions')}>
    <MultiResendAction rows={rows} refetch={refetch} />
    <MultiCancelAction rows={rows} refetch={refetch} />
  </DropdownButton>
);
