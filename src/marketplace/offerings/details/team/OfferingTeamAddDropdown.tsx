import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { AssignOfferingUserButton } from './AssignOfferingUserButton';
import { InviteOfferingUserButton } from './InviteOfferingUserButton';

interface OfferingTeamAddDropdownProps {
  offering: Offering;
  refetch(): void;
}

/**
 * Team toolbar "Add" dropdown — primary button with a caret over Invite and
 * Assign, matching the org and resource Team pages.
 *
 * Both actions need `OFFERING.CREATE_PERMISSION`, held either on the offering
 * itself (OFFERING.MANAGER) or on the parent organization (CUSTOMER.OWNER,
 * SERVICE_PROVIDER.MANAGER) — the same two paths `can_manage_invitation_with`
 * walks server-side. The dropdown is hidden entirely when neither holds.
 *
 * Private offerings are excluded: `UserRoleCreateSerializer.validate` refuses
 * to grant a role when `offering.shared is False`, so the actions are disabled
 * with an explanation rather than left to fail on submit.
 */
export const OfferingTeamAddDropdown: FC<OfferingTeamAddDropdownProps> = ({
  offering,
  refetch,
}) => {
  const user = useUser();
  const canAdd = hasPermission(user, {
    permission: PermissionEnum.CREATE_OFFERING_PERMISSION,
    offeringId: offering.uuid,
    customerId: offering.customer_uuid ?? undefined,
  });

  if (!canAdd) return null;

  const isPrivate = offering.shared === false;
  const tooltip = isPrivate
    ? translate('Roles cannot be granted on a private offering.')
    : undefined;

  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle
        variant="primary"
        size="lg"
        className="no-arrow btn-icon-right"
      >
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        <InviteOfferingUserButton
          offering={offering}
          refetch={refetch}
          disabled={isPrivate}
          tooltip={tooltip}
        />
        <AssignOfferingUserButton
          offering={offering}
          refetch={refetch}
          disabled={isPrivate}
          tooltip={tooltip}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};
