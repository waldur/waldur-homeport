import {
  User,
  Project,
  Customer as SdkCustomer,
  CustomerCredit,
  Resource,
} from 'waldur-js-client';
export { User, Project, Payment } from 'waldur-js-client';

export interface Customer extends SdkCustomer {
  credit?: CustomerCredit;
}

export type PhoneNumber =
  | string
  | {
      national_number: string;
      country_code: string;
    };

export interface WorkspaceState {
  user: User;
  impersonatorUser: User;
  customer?: Customer;
  project?: Project;
  resource?: Resource;
}
