import React from 'react';

export interface ProviderConfig {
  name: string;
  type: string;
  component: React.ComponentType;
  endpoint: string;
  icon: string;
  serializer: (details: any) => any;
}

export interface ProviderStatistics {
  active_campaigns: number;
  current_customers: number;
  customers_number_change: number;
  active_resources: number;
  resources_number_change: number;
  active_and_paused_offerings: number;
  unresolved_tickets: number;
  pending_orders: number;
  erred_resources: number;
}
