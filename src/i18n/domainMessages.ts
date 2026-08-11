import { translate } from 'waldur-i18n-runtime';

/**
 * Deployment-specific terminology overrides, keyed by
 * `ENV.plugins.WALDUR_CORE.TRANSLATION_DOMAIN`. Wired into the shared
 * translate() as a message-transform hook in ./translate.
 */
export const DOMAIN_MESSAGES: Record<string, Record<string, string>> = {
  service_catalogue: {
    'Explore {deployment} Marketplace': translate(
      'Explore {deployment} service catalog',
    ),
    'Explore marketplace': translate('Explore service catalog'),
    'Go to marketplace': translate('Go to service catalog'),
    'Label that is visible to users in Marketplace.': translate(
      'Label that is visible to users in service catalog.',
    ),
    Marketplace: translate('Service catalog'),
    'Marketplace offering': translate('Service catalog offering'),
    'Marketplace offerings': translate('Service catalog offerings'),
    'Marketplace resource pull has been scheduled.': translate(
      'Resource pull has been scheduled.',
    ),
    'Marketplace UUID': translate('Service catalog UUID'),
    'Unable to pull marketplace resource.': translate(
      'Unable to pull resource.',
    ),
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
    'Tell me what you need and I will help you find the best offering in the marketplace.':
      translate(
        'Tell me what you need and I will help you find the best offering in the service catalog.',
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
    'Explore marketplace': translate('Explore service catalog'),
    'Go to marketplace': translate('Go to service catalog'),
    'Label that is visible to users in Marketplace.': translate(
      'Label that is visible to users in service catalog.',
    ),
    Marketplace: translate('Service catalog'),
    'Marketplace offering': translate('Service catalog offering'),
    'Marketplace offerings': translate('Service catalog offerings'),
    'Marketplace resource pull has been scheduled.': translate(
      'Resource pull has been scheduled.',
    ),
    'Marketplace UUID': translate('Service catalog UUID'),
    'Unable to pull marketplace resource.': translate(
      'Unable to pull resource.',
    ),
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
    'Tell me what you need and I will help you find the best offering in the marketplace.':
      translate(
        'Tell me what you need and I will help you find the best offering in the service catalog.',
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
    'Explore marketplace': translate('Explore service catalog'),
    'Go to marketplace': translate('Go to service catalog'),
    'Label that is visible to users in Marketplace.': translate(
      'Label that is visible to users in service catalog.',
    ),
    Marketplace: translate('Service catalog'),
    'Marketplace offering': translate('Service catalog offering'),
    'Marketplace offerings': translate('Service catalog offerings'),
    'Marketplace resource pull has been scheduled.': translate(
      'Resource pull has been scheduled.',
    ),
    'Marketplace UUID': translate('Service catalog UUID'),
    'Unable to pull marketplace resource.': translate(
      'Unable to pull resource.',
    ),
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
    'Tell me what you need and I will help you find the best offering in the marketplace.':
      translate(
        'Tell me what you need and I will help you find the best offering in the service catalog.',
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
