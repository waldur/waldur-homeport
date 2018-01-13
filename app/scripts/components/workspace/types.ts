export interface User {
  is_staff: boolean;
  url: string;
  uuid: string;
}

export interface Customer {
  uuid: string;
  url: string;
  owners: User[];
}

export interface Project {
  uuid: string;
  url: string;
}

export interface Workspace {
  user: User;
  customer?: Customer;
  project?: Project;
}

export interface OuterState {
  workspace: Workspace;
}
