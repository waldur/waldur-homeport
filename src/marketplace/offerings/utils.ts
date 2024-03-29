import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

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
