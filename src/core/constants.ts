const CUSTOMER_OWNER_ROLE = 'owner';

const CUSTOMER_SUPPORT_ROLE = 'support';

const CUSTOMER_SERVICE_MANAGER_ROLE = 'service_manager';

export type CustomerRole =
  | typeof CUSTOMER_OWNER_ROLE
  | typeof CUSTOMER_SUPPORT_ROLE
  | typeof CUSTOMER_SERVICE_MANAGER_ROLE;
