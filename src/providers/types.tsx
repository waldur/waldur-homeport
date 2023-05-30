import React from 'react';

export interface ProviderFormProps {
  container: {};
}

export interface ProviderConfig {
  name: string;
  type: string;
  component: React.ComponentType<ProviderFormProps>;
  endpoint: string;
  icon: string;
  serializer: (details: any) => any;
}

interface Customer {
  url: string;
}

export interface ProviderCreateFormData {
  customer: Customer;
  name: string;
  type: ProviderConfig;
  options: Record<string, any>;
}

export interface ProviderStatistics {
  active_campaigns: number;
  current_customers: number;
  customers_number_change: number;
  active_resources: number;
  resources_number_change: number;
  active_and_paused_offerings: number;
  unresolved_tickets: number;
  pended_orders: number;
  erred_resources: number;
}
