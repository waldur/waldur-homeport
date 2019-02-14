import { AttributesType } from '../types';

export interface ResourceReference {
  resource_uuid: string;
  resource_type: string;
}

export interface Resource extends ResourceReference {
  attributes: AttributesType;
  backend_metadata: AttributesType;
  offering_name: string;
  offering_type: string;
  state: string;
  scope?: string;
}
