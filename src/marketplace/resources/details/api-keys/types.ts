import {
  OfferingComponent,
  ResourceApiKeyState,
  ResourceApiKeyStatus,
} from 'waldur-js-client';

export type ApiKeyState = ResourceApiKeyState;

export type ApiKeyRow = ResourceApiKeyStatus;

export interface KeyComponent {
  type: string;
  name?: string | null;
  measured_unit?: string | null;
  // Periods other than month are offered to keys where the component offers
  // them to resources.
  billing_type?: OfferingComponent['billing_type'];
  spending_limit_periods?: OfferingComponent['spending_limit_periods'];
}
