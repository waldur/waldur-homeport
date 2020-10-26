import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';

export function getBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
    },
    {
      label: translate('Public offerings'),
      state: 'marketplace-vendor-offerings',
    },
  ];
}

const ARTICLE_CODE_PATTERN = new RegExp(
  '^[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]$',
);

export const articleCodeValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate('Code is too short.');
  }
  if (!value.match(ARTICLE_CODE_PATTERN)) {
    return translate('Code should consist of latin symbols or numbers.');
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
