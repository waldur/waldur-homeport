import { Plan } from '@waldur/marketplace/types';

export interface OfferingFormData {
  plan?: Plan;
  attributes?: {[key: string]: any};
}
