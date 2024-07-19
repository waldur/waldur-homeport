import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { checkCustomerUser } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

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

export const scrollToSectionById = (section: string) => {
  const el = document.getElementById(section);
  if (!el) return;
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: el.offsetTop - 180,
  });
};

export const getOfferingBreadcrumbItems = (offering): IBreadcrumbItem[] => {
  if (!offering) return [];
  return [
    {
      key: 'organizations',
      text: translate('Organizations'),
      to: 'organizations',
    },
    {
      key: 'organization.dashboard',
      text: offering.customer_name,
      to: 'organization.dashboard',
      params: { uuid: offering.customer_uuid },
      ellipsis: 'xl',
      maxLength: 11,
    },
    {
      key: 'marketplace-vendor-offerings',
      text: translate('Offerings'),
      to: 'marketplace-vendor-offerings',
      params: { uuid: offering.customer_uuid },
      ellipsis: 'md',
    },
    {
      key: 'offering',
      text: offering.name,
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
