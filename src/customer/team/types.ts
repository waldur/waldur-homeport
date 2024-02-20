export interface NestedProjectPermission {
  uuid: string;
  name: string;
  role_name: string;
  expiration_time: string;
}

export interface NestedCustomerPermission {
  email: string;
  full_name: string;
  role_name: string;
  username: string;
  uuid: string;
  expiration_time: string;
  projects: NestedProjectPermission[];
}
