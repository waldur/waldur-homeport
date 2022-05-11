import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';

export function getBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: translate('Public offerings'),
      state: 'marketplace-vendor-offerings',
    },
  ];
}

const ARTICLE_CODE_PATTERN = new RegExp(
  '^[A-Z0-9]{8}_[A-Z0-9]{5}-[A-Z0-9]{4}$',
);

export const articleCodeValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length < 2) {
    return translate('Code is too short.');
  }
  if (!value.match(ARTICLE_CODE_PATTERN)) {
    return translate('Code should be in the format XXXXXXXX_YYYYY-ZZZZ');
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
