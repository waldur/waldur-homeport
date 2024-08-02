import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { MultiResendAction } from './MultiResendAction';

export const InvitationsMultiSelectActions = ({
  rows,
  refetch,
}: {
  rows: any[];
  refetch(): void;
}) => (
  <DropdownButton variant="primary" title={translate('All actions')}>
    <MultiResendAction rows={rows} refetch={refetch} />
  </DropdownButton>
);
