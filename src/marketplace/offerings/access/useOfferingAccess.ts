import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useCallback, useMemo, useState } from 'react';
import { marketplacePublicOfferingsRetrieve, Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import {
  fetchEligibleCalls,
  getSubmittableRounds,
  SubmittableRound,
} from '@/marketplace/offerings/apply/eligibleCalls';
import { isProposalRequestEnabled } from '@/marketplace/serviceAccessMode';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { usesCallVocabulary } from '@/proposals/presentation';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { AccessMethod, OrderTarget } from './types';

const RequestAccessDialog = lazyComponent(() =>
  import('./RequestAccessDialog').then((module) => ({
    default: module.RequestAccessDialog,
  })),
);

const AddProposalDialog = lazyComponent(() =>
  import('@/proposals/proposal/create/AddProposalDialog').then((module) => ({
    default: module.AddProposalDialog,
  })),
);

interface UseOfferingAccessOptions {
  /**
   * Why ordering is unavailable, as computed by the caller's
   * `useOfferingAccessibility`. Scoped to the order method only: it is false
   * exactly when the user has no available plan, which is the person the
   * application route exists for.
   */
  orderDisabledReason?: string;
}

export const useOfferingAccess = (
  offering: Offering,
  { orderDisabledReason }: UseOfferingAccessOptions = {},
) => {
  const user = useUser();
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const { openDialog, confirm } = useModal();
  const { showError } = useNotify();
  const [loading, setLoading] = useState(false);

  const canOrder =
    !isFeatureVisible(MarketplaceFeatures.catalogue_only) &&
    (!user || hasPermissionOnAnyScope(user, PermissionEnum.CREATE_ORDER));

  // In 'calls' mode there is no offering page to apply from, so the route is
  // not offered; the other two modes both reach services through offerings.
  const canApply =
    Boolean(offering?.open_for_proposals) && isProposalRequestEnabled();

  const goToOrder = useCallback(
    (target?: OrderTarget) => {
      setLoading(true);
      // The deploy wizard resolves its own organization/project when these are
      // absent. Both are needed together: with only project_uuid it preselects
      // the project but leaves the organization empty, and the project field
      // stays disabled because it is gated on the organization.
      router.stateService.go('marketplace-offering-public', {
        offering_uuid: offering.uuid,
        ...(target?.customer
          ? { organization_uuid: target.customer.uuid }
          : {}),
        ...(target?.project ? { project_uuid: target.project.uuid } : {}),
      });
    },
    [router, offering.uuid],
  );

  /**
   * Paused/archived blocks both routes; a missing plan or an organisation
   * restriction blocks ordering only.
   */
  const stateDisabledReason = useMemo(() => {
    if (offering?.state === 'Active') {
      return undefined;
    }
    if (offering?.state === 'Paused') {
      return (
        offering.paused_reason ||
        translate('Requesting of new resources has been temporarily paused')
      );
    }
    return translate('This offering is not accepting new requests.');
  }, [offering?.state, offering?.paused_reason]);

  const methods = useMemo<AccessMethod[]>(() => {
    const items: AccessMethod[] = [];
    if (canOrder) {
      items.push({
        key: 'order',
        label: translate('Order now'),
        description: translate(
          'Added to a project you already belong to. Provisioning starts as soon as the order is approved.',
        ),
        disabledReason: stateDisabledReason || orderDisabledReason,
        run: goToOrder,
      });
    }
    if (canApply) {
      items.push({
        key: 'apply',
        label: translate('Apply for access'),
        description: usesCallVocabulary()
          ? translate(
              'Submitted to an open call and reviewed by the provider. If it is accepted, a new project is created with the resources you asked for.',
            )
          : translate(
              'Reviewed by the provider before access is granted. If accepted, a new project is created with the resources you asked for.',
            ),
        disabledReason: stateDisabledReason,
        // Resolved by the dialog, which owns the call choice.
        run: () => undefined,
      });
    }
    return items;
  }, [canOrder, canApply, stateDisabledReason, orderDisabledReason, goToOrder]);

  const actionable = useMemo(
    () => methods.filter((method) => !method.disabledReason),
    [methods],
  );

  const handleRequestAccess = useCallback(
    async (e?: React.MouseEvent) => {
      // The card body is a link to the offering page; keep the click here.
      e?.preventDefault();
      e?.stopPropagation();
      if (!actionable.length) {
        return;
      }
      if (!user) {
        try {
          await confirm(
            translate('Authentication required'),
            translate(
              'Please log in to request access to this offering. You will be redirected to the login page.',
            ),
            { positiveButton: translate('Log in') },
          );
          // Come back here after signing in, as usePublicCallApply does.
          router.stateService.go('login', {
            toState: state?.name,
            toParams: params,
          });
        } catch {
          // User cancelled
        }
        return;
      }
      // Ordering alone needs no further choice.
      if (actionable.length === 1 && actionable[0].key === 'order') {
        goToOrder();
        return;
      }

      // Applying is on the table, so resolve the calls before opening anything.
      // The dialog then carries the method radio and the call picker together,
      // instead of handing off to a second popup.
      setLoading(true);
      let rounds: SubmittableRound[] = [];
      try {
        rounds = getSubmittableRounds(await fetchEligibleCalls(offering));
      } catch {
        showError(
          translate(
            'Unable to load the application options for this offering.',
          ),
        );
        return;
      } finally {
        setLoading(false);
      }

      // With no round to submit to, applying is not actually on offer.
      const routes = rounds.length
        ? actionable
        : actionable.filter((method) => method.key !== 'apply');

      if (!routes.length) {
        showError(
          translate('This offering is not accepting applications right now.'),
        );
        return;
      }
      if (routes.length === 1 && routes[0].key === 'order') {
        goToOrder();
        return;
      }
      // One route and one round leaves nothing to choose, so go to the form.
      if (routes.length === 1 && rounds.length === 1) {
        openDialog(AddProposalDialog, {
          // See RequestAccessDialog: the inline request needs the room.
          size: usesCallVocabulary() ? undefined : 'lg',
          resolve: {
            call: rounds[0].call,
            round: rounds[0].round,
            offering,
          },
        });
        return;
      }
      // Catalogue cards fetch a sparse offering, so organization_groups and
      // plugin_options are absent there. The project picker filters on both,
      // and silently offering organizations the offering restricts would be
      // worse than the crash it used to cause — so fetch the detail, but only
      // when the picker is actually about to be shown.
      let target = offering;
      if (
        routes.some((method) => method.key === 'order') &&
        offering.shared &&
        offering.organization_groups === undefined
      ) {
        setLoading(true);
        try {
          target = await marketplacePublicOfferingsRetrieve({
            path: { uuid: offering.uuid },
          }).then((response) => response.data as Offering);
        } catch {
          showError(translate('Unable to load this offering.'));
          return;
        } finally {
          setLoading(false);
        }
      }

      openDialog(RequestAccessDialog, {
        // The round table needs more width than the default dialog offers.
        size: rounds.length > 1 ? 'lg' : undefined,
        resolve: { offering: target, methods: routes, rounds },
      });
    },
    [
      actionable,
      user,
      confirm,
      router,
      state,
      params,
      openDialog,
      offering,
      goToOrder,
      showError,
    ],
  );

  return {
    visible: methods.length > 0,
    loading,
    disabled: actionable.length === 0,
    // With both routes blocked the reasons agree, so the first one is enough.
    disabledReason: actionable.length ? undefined : methods[0]?.disabledReason,
    handleRequestAccess,
  };
};
