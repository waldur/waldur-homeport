import { IPromise } from 'angular';

import { ResourceState } from '@waldur/resource/types';

export interface ZabbixLink {
  name: string;
  url: string;
  service_settings_uuid: string;
  internal_ip: string;
}

export interface ZabbixLinkRequest {
  resource?: string;
}

export type ZabbixLinkApi = (request: ZabbixLinkRequest) => IPromise<ZabbixLink[]>;

export interface ZabbixTemplate {
  name: string;
  url: string;
}

export interface ZabbixTemplateRequest {
  name?: string;
  settings_uuid?: string;
}

export type ZabbixTemplateApi = (request: ZabbixTemplateRequest) => IPromise<ZabbixTemplate[]>;

export interface ZabbixHost {
  state: ResourceState;
}
