import { Fragment, ReactNode } from 'react';

import { ENV } from '@/core/config';

import { LanguageUtilsService } from './LanguageUtilsService';
import { Translate } from './types';

export const formatJsxTemplate = (template, context) => {
  if (!context) {
    return template;
  }
  return (
    <Fragment>
      {template.split(/\{|\}/g).map((part, index) => (
        <Fragment key={index}>
          {index % 2 === 0 ? part : context[part]}
        </Fragment>
      ))}
    </Fragment>
  );
};

export const formatJsx = (
  template: string,
  context: Record<string, (s: string) => ReactNode>,
) => {
  const pattern = /<([^>]+)>([^<]*)<\/([^>]+)>/g;
  const parts = [];
  let matches,
    prevIndex = 0;
  while ((matches = pattern.exec(template)) !== null) {
    parts.push(template.substring(prevIndex, matches.index));
    parts.push(context[matches[1]](matches[2]));
    prevIndex = matches[0].length + matches.index;
  }
  if (prevIndex !== template.length) {
    parts.push(template.substring(prevIndex));
  }
  return (
    <Fragment>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </Fragment>
  );
};

export const formatTemplate: Translate = (template, context) =>
  context ? template.replace(/{(.+?)}/g, (_, key) => context[key]) : template;

const translateTemplate = (template) =>
  LanguageUtilsService.dictionary[template] || template;

const getDomainMessage = (message) => {
  const domain = ENV.plugins?.WALDUR_CORE.TRANSLATION_DOMAIN;
  if (!domain) {
    return message;
  }
  if (!DOMAIN_MESSAGES[domain]) {
    return message;
  }
  return DOMAIN_MESSAGES[domain][message] || message;
};

export const translate: Translate = (
  template,
  context,
  interpolator = formatTemplate,
) => interpolator(translateTemplate(getDomainMessage(template)), context);

const DOMAIN_MESSAGES = {
  service_catalogue: {
    'Explore {deployment} Marketplace': translate(
      'Explore {deployment} service catalog',
    ),
    'Go to marketplace': translate('Go to service catalog'),
    'Label that is visible to users in Marketplace.': translate(
      'Label that is visible to users in service catalog.',
    ),
    Marketplace: translate('Service catalog'),
    'Marketplace offerings': translate('Service catalog offerings'),
    'Welcome to marketplace': translate('Welcome to service catalog'),
    'Marketplace services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.':
      translate(
        'Services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.',
      ),
    'Register as a customer of our portal and provide your cloud services through the Marketplace.':
      translate(
        'Register as a customer of our portal and provide your cloud services through the service catalog.',
      ),
    'Resource is not connected to the marketplace yet.': translate(
      'Resource is not connected to the service catalog yet.',
    ),
    'There are no categories in marketplace yet.': translate(
      'There are no categories in catalog yet.',
    ),
    'There are no offerings in marketplace yet.': translate(
      'There are no offerings in catalog yet.',
    ),
    'Unique ID of a resource created via Marketplace': translate(
      'Unique ID of a resource created via service catalog',
    ),
    'You can find offerings to order in the marketplace': translate(
      'You can find offerings to order in the service catalog',
    ),
  },
  academic: {
    'Become a customer of our portal. Provision IT services from the Marketplace and manage your team from one place.':
      translate(
        'Become a customer of our portal. Provision IT services from the catalog and manage your team from one place.',
      ),
    'Explore {deployment} Marketplace': translate(
      'Explore {deployment} service catalog',
    ),
    'Go to marketplace': translate('Go to service catalog'),
    'Label that is visible to users in Marketplace.': translate(
      'Label that is visible to users in service catalog.',
    ),
    Marketplace: translate('Service catalog'),
    'Marketplace offerings': translate('Service catalog offerings'),
    'Welcome to marketplace': translate('Welcome to service catalog'),
    'Marketplace services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.':
      translate(
        'Services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.',
      ),
    'Register as a customer of our portal and provide your cloud services through the Marketplace.':
      translate(
        'Register as a customer of our portal and provide your cloud services through the service catalog.',
      ),
    'Resource is not connected to the marketplace yet.': translate(
      'Resource is not connected to the service catalog yet.',
    ),
    'There are no categories in marketplace yet.': translate(
      'There are no categories in catalog yet.',
    ),
    'There are no offerings in marketplace yet.': translate(
      'There are no offerings in catalog yet.',
    ),
    'Unique ID of a resource created via Marketplace': translate(
      'Unique ID of a resource created via service catalog',
    ),
    'You can find offerings to order in the marketplace': translate(
      'You can find offerings to order in the service catalog',
    ),
    Purchase: translate('Request'),
    'You have the right to purchase service without additional approval.':
      translate(
        'You have the right to request service without additional approval.',
      ),
  },
  academic_shared: {
    'Become a customer of our portal. Provision IT services from the Marketplace and manage your team from one place.':
      translate(
        'Become a customer of our portal. Provision IT services from the catalog and manage your team from one place.',
      ),
    'Explore {deployment} Marketplace': translate(
      'Explore {deployment} service catalog',
    ),
    'Go to marketplace': translate('Go to service catalog'),
    'Label that is visible to users in Marketplace.': translate(
      'Label that is visible to users in service catalog.',
    ),
    Marketplace: translate('Service catalog'),
    'Marketplace offerings': translate('Service catalog offerings'),
    'Welcome to marketplace': translate('Welcome to service catalog'),
    'Marketplace services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.':
      translate(
        'Services can only be provisioned for a certain affiliation. You currently do not have any organizations or projects connected with your account.',
      ),
    'Register as a customer of our portal and provide your cloud services through the Marketplace.':
      translate(
        'Register as a customer of our portal and provide your cloud services through the service catalog.',
      ),
    'Resource is not connected to the marketplace yet.': translate(
      'Resource is not connected to the service catalog yet.',
    ),
    'There are no categories in marketplace yet.': translate(
      'There are no categories in catalog yet.',
    ),
    'There are no offerings in marketplace yet.': translate(
      'There are no offerings in catalog yet.',
    ),
    'Unique ID of a resource created via Marketplace': translate(
      'Unique ID of a resource created via service catalog',
    ),
    'You can find offerings to order in the marketplace': translate(
      'You can find offerings to order in the service catalog',
    ),
    Purchase: translate('Request'),
    'You have the right to purchase service without additional approval.':
      translate(
        'You have the right to request service without additional approval.',
      ),
  },
};
