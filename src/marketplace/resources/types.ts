import { AttributesType } from '../types';

export interface ResourceReference {
  resource_uuid: string;
  resource_type: string;
}

export type ResourceState =
  | 'Creating'
  | 'OK'
  | 'Erred'
  | 'Updating'
  | 'Terminating'
  | 'Terminated'
  ;

export interface Resource extends ResourceReference {
  name: string;
  attributes: AttributesType;
  backend_metadata: AttributesType;
  offering_name: string;
  offering_type: string;
  state: string;
  scope?: string;
  created?: string;
  category_title?: string;
  project_name?: string;
}
