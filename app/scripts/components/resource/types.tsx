export type ResourceState =
  | 'OK'
  | 'Erred'
  | 'Creation Scheduled'
  | 'Creating'
  | 'Update Scheduled'
  | 'Updating'
  | 'Deletion Scheduled'
  | 'Deleting'
  ;

export interface BaseResource {
  state: ResourceState;
  runtime_state: string;
}

export interface Volume extends BaseResource {
  size: number;
}

export interface VirtualMachine extends BaseResource {
  cores: number;
  disk: number;
  ram: number;
}
