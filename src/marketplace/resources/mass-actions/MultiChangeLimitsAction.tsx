import { TimerIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useModal } from '@/modal/actions';
import { TENANT_TYPE } from '@/openstack/constants';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const isLimitsActionDisabledByOffering = (resource: Resource): boolean => {
  const disabled = (resource.offering_plugin_options as any)
    ?.disabled_resource_actions;
  return (
    Array.isArray(disabled) && disabled.includes(ResourceAction.UPDATE_LIMITS)
  );
};

const MultiChangeLimitsDialog = lazyComponent(() =>
  import('./MultiChangeLimitsDialog').then((module) => ({
    default: module.MultiChangeLimitsDialog,
  })),
);

export const MultiChangeLimitsAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch(): void;
}) => {
  const { openDialog } = useModal();
  const user = useUser();

  // Hide-vs-disable: missing permission is the only condition the user cannot
  // fix from this view, so it hides the action entirely. The other conditions
  // are fixable by changing the selection, so we show the action disabled
  // with a tooltip explaining what needs to change.
  //
  // The per-resource update_limits endpoint is the one being called per row, so
  // the gates here align with the single-resource ChangeLimitsAction (state,
  // plan presence) plus the resource-type restriction this batch action is
  // scoped to. Offering uniformity is not enforced: every OpenStack-tenant
  // offering uses the same limit serializer and the universal components
  // (cores/ram/storage); per-volume-type mismatches degrade to per-row backend
  // rejections, which useBatchMutation reports as partial success.
  const { hidden, tooltip } = useMemo(() => {
    if (!rows.length) return { hidden: true, tooltip: undefined };

    const lacksPermission = rows.some(
      (resource) =>
        !hasPermission(user, {
          permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
          projectId: resource.project_uuid,
          customerId: resource.customer_uuid,
        }),
    );
    if (lacksPermission) return { hidden: true, tooltip: undefined };

    if (rows.some((r) => r.offering_type !== TENANT_TYPE)) {
      return {
        hidden: false,
        tooltip: translate(
          'Available only when every selected resource is an OpenStack tenant.',
        ),
      };
    }
    // Respect the offering configuration: a provider can disable the limit
    // change action per offering (offering_plugin_options.disabled_resource_
    // actions). The single-resource action hides itself in that case via
    // ActionItem; for the batch we disable with an explanation so the user can
    // deselect the affected VPCs.
    if (rows.some(isLimitsActionDisabledByOffering)) {
      return {
        hidden: false,
        tooltip: translate(
          'Limit changes are disabled for some of the selected VPCs’ offerings.',
        ),
      };
    }
    // Two state fields gate this. r.state is the marketplace state; single's
    // ChangeLimitsAction goes through ModalActionsRouter which loads the
    // OpenStack tenant scope and runs validateState('OK') against the tenant's
    // own state — mirrored on the row as backend_metadata.state (and shown in
    // the UI badge, e.g. "Update Scheduled"). Gating on both keeps mass in
    // lock-step with single.
    if (
      rows.some((r) => {
        const marketplaceState = r.state?.toLowerCase();
        const backendState = r.backend_metadata?.state?.toLowerCase();
        return (
          marketplaceState !== 'ok' || (backendState && backendState !== 'ok')
        );
      })
    ) {
      return {
        hidden: false,
        tooltip: translate('All selected VPCs must be in OK state.'),
      };
    }
    // Match the single-resource action: a resource is "planned" if it has
    // either a plan_uuid or a marketplace_plan_uuid (the latter is not on the
    // Resource type but can be present at runtime, as the single action relies
    // on).
    if (rows.some((r) => !(r.plan_uuid || (r as any).marketplace_plan_uuid))) {
      return {
        hidden: false,
        tooltip: translate(
          'Some of the selected VPCs are not associated with a plan.',
        ),
      };
    }
    return { hidden: false, tooltip: undefined };
  }, [rows, user]);

  if (hidden) return null;

  const callback = () =>
    openDialog(MultiChangeLimitsDialog, {
      resolve: { rows, refetch },
      // Largest modal (with the preview table) — falls back to fullscreen on
      // smaller screens; the table itself scrolls horizontally if still wider.
      size: 'xl',
      fullscreen: 'lg-down',
    });

  return (
    <ActionItem
      title={translate('Change limits')}
      action={callback}
      iconNode={<TimerIcon weight="bold" />}
      disabled={Boolean(tooltip)}
      tooltip={tooltip}
    />
  );
};
