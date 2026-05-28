import { User } from 'waldur-js-client';

import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { Offering } from '@/marketplace/types';
import { IBreadcrumbItem } from '@/navigation/types';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { PublicOfferingBreadcrumbPopover } from './PublicOfferingBreadcrumbPopover';

const ARTICLE_CODE_PATTERN = new RegExp(
  '^[A-Za-z0-9][A-Za-z0-9-_]*[A-Za-z0-9]$',
);

export const articleCodeValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate('Code is too short.');
  }
  if (!value.match(ARTICLE_CODE_PATTERN)) {
    return translate(
      'Code should consist of latin symbols, numbers, dashes and underscores.',
    );
  }
};

/**
 * Collects initial limit values for an offering based on its components.
 *
 * This function only includes components that are managed via the 'limits' dictionary
 * in the backend. Specifically:
 * 1. Components with billing_type 'limit' (standard marketplace quotas).
 * 2. Components with billing_type 'one' (one-time) that are marked as 'is_prepaid'.
 *
 * Non-prepaid one-time components, fixed-price components, and usage-based components
 * are excluded because sending them in the 'limits' dictionary during order submission
 * would trigger 'Invalid types' validation errors on the backend.
 *
 * @param offering The offering to get default limits for.
 * @returns A dictionary of component types and their default/minimum values.
 */
export const getDefaultLimits = (
  offering: Offering,
): Record<string, number> => {
  const limits: Record<string, number> = {};
  for (const component of offering.components) {
    if (component.offering_uuid && component.offering_uuid !== offering.uuid) {
      continue;
    }
    if (
      component.billing_type === 'limit' ||
      (component.billing_type === 'one' && component.is_prepaid)
    ) {
      if (component.default_limit) {
        limits[component.type] = component.default_limit;
      } else if (component.min_value) {
        limits[component.type] = component.min_value;
      }
    }
  }
  const limitParser = getFormLimitParser(offering.type);
  return limitParser(limits);
};

export const scrollToSectionById = (section: string, extraOffset = 180) => {
  const el = document.getElementById(section);
  if (!el) return;
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: el.offsetTop - extraOffset,
  });
};

export const getPublicOfferingBreadcrumbItems = (
  offering,
  router,
): IBreadcrumbItem[] => {
  return [
    {
      key: 'marketplace',
      text: translate('Marketplace'),
      to: 'public.marketplace-landing',
    },
    {
      key: 'service-provider',
      text: offering?.customer_name || '...',
      to: 'marketplace-providers.details',
      params: offering ? { customer_uuid: offering.customer_uuid } : undefined,
      ellipsis: 'xl',
      truncate: true,
    },
    {
      key: 'marketplace-offerings',
      text: translate('Offerings'),
      ellipsis: 'md',
      onClick: () => {
        if (!offering) return;
        // Set organization filter to offerings
        const url = router.stateService.href('public.offerings');
        const organizationParam = encodeURIComponent(
          `${offering.customer_uuid}::${offering.customer_name || ''}`,
        );
        router.urlService.url(`${url}?organization=${organizationParam}`);
      },
    },
    {
      key: 'offering',
      text: offering?.name || '...',
      dropdown: offering
        ? (close) => (
            <PublicOfferingBreadcrumbPopover
              offering={offering}
              close={close}
            />
          )
        : undefined,
      truncate: true,
      active: true,
    },
  ];
};

export const isOfferingRestrictedToProject = (
  offering: Offering,
  user: User,
) => {
  const isStaffOrOwner = checkIsOwnerOrStaff(
    { uuid: offering.customer_uuid },
    user,
  );
  const isRestrictedAndNotAllowed =
    !offering.shared &&
    offering.project_uuid &&
    user &&
    !user.permissions.find(
      (permission) =>
        permission.scope_type === 'project' &&
        permission.scope_uuid === offering.project_uuid,
    );
  const isAllowed = isStaffOrOwner || !isRestrictedAndNotAllowed;

  return {
    isRestricted: !offering.shared,
    isAllowed,
  };
};

export const parentOfferingFilter = {
  type: 'OpenStack.Tenant',
};
