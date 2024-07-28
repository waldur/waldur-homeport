import { CampaignFormData } from '@waldur/marketplace/service-providers/types';
import { IBreadcrumbItem } from '@waldur/navigation/types';

export const serializeCampaign = (formData: CampaignFormData) => ({
  name: formData.name,
  discount_type: formData.discount_type,
  discount: formData.discount,
  start_date: formData.start_date,
  end_date: formData.end_date,
  stock: formData.stock,
  auto_apply: formData.auto_apply,
  service_provider: formData.service_provider.url,
  offerings: formData.offerings.map((offering) => offering.uuid),
});

export const getProviderBreadcrumbItems = (provider): IBreadcrumbItem[] => [
  {
    key: 'marketplace',
    text: 'Marketplace',
    to: 'public.marketplace-landing',
  },
  {
    key: 'service-providers',
    text: 'Service providers',
    to: 'public.marketplace-providers',
  },
  {
    key: 'provider',
    text: provider.customer_name,
    active: true,
  },
];
