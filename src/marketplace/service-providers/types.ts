import {
  ProviderOfferingDetails as Offering,
  ServiceProvider,
} from 'waldur-js-client';

interface Campaign {
  uuid?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  coupon: string;
  discount_type: string;
  discount: number;
  offerings: Offering[];
  required_offerings: Offering[];
  stock: number;
  months: number;
  auto_apply: boolean;
  service_provider: ServiceProvider;
}

export type CampaignFormData = Campaign;
