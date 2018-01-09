export interface User {
  uuid: string;
}

export interface Customer {
  uuid: string;
  url: string;
  owners: User[];
}
