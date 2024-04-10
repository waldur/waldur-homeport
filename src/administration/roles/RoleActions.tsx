import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RoleDeleteButton } from './RoleDeleteButton';
import { RoleDescriptionEditButton } from './RoleDescriptionEditButton';
import { RoleEditButton } from './RoleEditButton';
import { RoleToggleButton } from './RoleToggleButton';

export const RoleActions = ({ row, refetch }) => (
  <DropdownButton
    title={translate('Actions')}
    variant="light"
    size="sm"
    data-cy="public-resources-list-actions-dropdown-btn"
  >
    <RoleEditButton row={row} refetch={refetch} />
    <RoleDescriptionEditButton row={row} refetch={refetch} />
    <RoleToggleButton row={row} refetch={refetch} />
    {!row.is_system_role ? (
      <RoleDeleteButton row={row} refetch={refetch} />
    ) : null}
  </DropdownButton>
);
