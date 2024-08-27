import { change } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { checkCustomerUser } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

import { ADMIN_OFFERINGS_FILTER_FORM_ID } from './admin/constants';

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

export const getDefaultLimits = (offering: Offering): Record<string, number> =>
  offering.components.reduce(
    (acc, component) =>
      component.default_limit
        ? {
            ...acc,
            [component.type]: component.default_limit,
          }
        : acc,
    {},
  );

export const scrollToSectionById = (section: string, extraOffset = 180) => {
  const el = document.getElementById(section);
  if (!el) return;
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: el.offsetTop - extraOffset,
  });
};

export const getOfferingBreadcrumbItems = (offering): IBreadcrumbItem[] => {
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
      maxLength: 11,
    },
    {
      key: 'marketplace-vendor-offerings',
      text: translate('Offerings'),
      to: 'marketplace-vendor-offerings',
      params: offering ? { uuid: offering.customer_uuid } : undefined,
      ellipsis: 'md',
    },
    {
      key: 'offering',
      text: offering?.name || '...',
      truncate: true,
      active: true,
    },
  ];
};

export const getPublicOfferingBreadcrumbItems = (
  offering,
  dispatch,
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
      maxLength: 11,
    },
    {
      key: 'marketplace-offerings',
      text: translate('Offerings'),
      ellipsis: 'md',
      onClick: () => {
        if (!offering) return;
        // Set organization filter to offerings
        const customer = {
          name: offering.customer_name,
          uuid: offering.customer_uuid,
        };
        dispatch(
          change(ADMIN_OFFERINGS_FILTER_FORM_ID, 'organization', customer),
        );
        router.stateService.go('public.offerings');
      },
    },
    {
      key: 'offering',
      text: offering?.name || '...',
      truncate: true,
      active: true,
    },
  ];
};

export const isOfferingRestrictedToProject = (
  offering: Offering,
  user: User,
) => {
  const isStaffOrOwner = checkCustomerUser(
    { uuid: offering.customer_uuid },
    user,
  );
  const isRestrictedAndNotAllowed =
    !offering.shared &&
    offering.project_uuid &&
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
