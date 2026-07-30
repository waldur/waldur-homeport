import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { marketplaceProviderResourcesSyncUserRoles } from 'waldur-js-client';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { checkScope, hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { ToolbarButton } from '@/table/ToolbarButton';
import { useUser } from '@/workspace/hooks';

/**
 * Provider/staff action asking the offering's site agent to re-sync
 * this resource's memberships. Rendered only when the offering opted
 * into membership sync status reporting — the same flag that gates the
 * per-member sync badges this action heals — and the user passes the
 * same check the backend enforces (staff, or UPDATE_OFFERING at
 * offering or offering-customer scope). The backend remains the
 * authority (403) and applies a per-resource throttle (429).
 */
export const ResyncMembershipButton: FunctionComponent<{
  resourceUuid: string;
  offering: { uuid: string; customer_uuid?: string };
}> = ({ resourceUuid, offering }) => {
  const user = useUser();
  const { showSuccess, showError } = useNotify();
  const [busy, setBusy] = useState(false);
  // Mirrors ResourceSyncUserRolesView.check_object_permissions; all
  // inputs (user.permissions, ENV.roles) are already client-side.
  const canResync =
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: offering.customer_uuid,
    }) ||
    checkScope(user, 'offering', offering.uuid, PermissionEnum.UPDATE_OFFERING);
  const trigger = async () => {
    setBusy(true);
    try {
      await marketplaceProviderResourcesSyncUserRoles({
        path: { uuid: resourceUuid },
      });
      showSuccess(
        translate('Membership re-sync requested.'),
        translate(
          'Applied on the next agent cycle at the latest; badges refresh after the agent reports back.',
        ),
      );
    } catch (error) {
      // The SDK's error interceptor attaches the Response as
      // error.response; network failures have no status and fall to
      // the generic message.
      const status = error?.response?.status ?? error?.status;
      if (status === 429) {
        showError(translate('A re-sync was already requested recently.'));
      } else if (status === 403 || status === 404) {
        showError(
          translate(
            'You are not allowed to trigger a re-sync for this resource.',
          ),
        );
      } else {
        showError(translate('Unable to request membership re-sync.'));
      }
    } finally {
      setBusy(false);
    }
  };
  if (!canResync) {
    return null;
  }
  return (
    <ToolbarButton
      title={translate('Re-sync memberships')}
      tooltip={translate(
        'Ask the offering agent to re-apply role grants on the provider side.',
      )}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      onClick={trigger}
      pending={busy}
    />
  );
};
