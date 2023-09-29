import { CampaignFormData } from '@waldur/marketplace/service-providers/types';

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
