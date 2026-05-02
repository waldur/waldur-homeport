import {
  CaretDownIcon,
  EnvelopeSimpleIcon,
  PlusCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { openResourceInvitationDialog } from '../projects/openResourceInvitationDialog';

import { AddUserButton } from './AddUserButton';

interface ResourceTeamAddDropdownProps {
  scope: 'resource' | 'resource_project';
  scopeUuid: string;
  scopeUrl: string;
  scopeLabel: string;
  /** Parent project's uuid — used by AddUserDialog for permission checks */
  projectUuid: string;
  /** Parent customer's uuid — used by hasPermission */
  customerUuid: string;
  offering;
  /** Whether to show the Assign-existing item (gated by Invite as well) */
  showAssign?: boolean;
  refetch(): void;
}

/**
 * Team toolbar "Add" dropdown. Mirrors the org-level
 * `TeamDropdownActions` shape — primary "+ Add" button with caret,
 * dropdown menu containing Invite and (when permitted) Assign — but
 * parameterized by scope so it works for both Resource and
 * ResourceProject. The Assign item is rendered disabled with an
 * explanatory tooltip for non-staff so the action stays discoverable.
 *
 * Hidden entirely if the user has no permission to invite (the only
 * always-applicable action of the two).
 */
export const ResourceTeamAddDropdown: FC<ResourceTeamAddDropdownProps> = ({
  scope,
  scopeUuid,
  scopeUrl,
  scopeLabel,
  projectUuid,
  customerUuid,
  offering,
  showAssign = true,
  refetch,
}) => {
  const user = useUser();
  const canInvite = hasPermission(user, {
    permission:
      scope === 'resource_project'
        ? PermissionEnum.CREATE_RESOURCE_PROJECT_PERMISSION
        : PermissionEnum.CREATE_RESOURCE_PERMISSION,
    projectId: projectUuid,
    customerId: customerUuid,
  });
  if (!canInvite) return null;

  const isStaff = Boolean(user?.is_staff);

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
        <ActionItem
          title={translate('Invite')}
          iconNode={<EnvelopeSimpleIcon weight="bold" />}
          action={() =>
            openResourceInvitationDialog({
              scopeUrl,
              scopeUuid,
              scopeLabel,
              contentType: scope,
              offeringUuid: offering?.uuid,
              user,
              refetch,
            })
          }
        />
        {showAssign && (
          <AddUserButton
            scope={scope}
            scopeUuid={scopeUuid}
            projectUuid={projectUuid}
            offering={offering}
            refetch={refetch}
            disabled={!isStaff}
            tooltip={
              !isStaff ? translate('Available for staff only') : undefined
            }
          />
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
