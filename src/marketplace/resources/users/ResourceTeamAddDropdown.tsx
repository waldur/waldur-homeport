import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { FC } from 'react';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { AddDropdownToggle } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { AddUserButton } from './AddUserButton';
import { InviteUserButton } from './InviteUserButton';

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
  /**
   * Button size. Use `'lg'` (default) in main/top-level table toolbars,
   * `'sm'` inside nested/expandable rows so the button fits the slim
   * nested header pattern.
   */
  size?: 'sm' | 'lg';
  refetch(): void;
}

/**
 * Team toolbar "Add" dropdown. Mirrors the org-level
 * `TeamDropdownActions` shape — primary "+ Add" button with caret,
 * dropdown menu containing Invite and (when permitted) Assign — but
 * parameterized by scope so it works for both Resource and
 * ResourceProject. Both Invite and Assign are gated by the same
 * CREATE_RESOURCE_PERMISSION check (held by project managers and above).
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
  size = 'lg',
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

  return (
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <AddDropdownToggle size={size} />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="start"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          <InviteUserButton
            scopeUrl={scopeUrl}
            scopeUuid={scopeUuid}
            scopeLabel={scopeLabel}
            contentType={scope}
            offeringUuid={offering?.uuid}
            user={user}
            refetch={refetch}
          />
          {showAssign && (
            <AddUserButton
              scope={scope}
              scopeUuid={scopeUuid}
              projectUuid={projectUuid}
              offering={offering}
              refetch={refetch}
              disabled={!canInvite}
              tooltip={
                !canInvite
                  ? translate('Available for project managers and above')
                  : undefined
              }
            />
          )}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
