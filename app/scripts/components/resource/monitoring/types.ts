export interface ZabbixLink {
  name: string;
  url: string;
  service_settings_uuid: string;
  internal_ip: string;
}

export interface ZabbixLinkRequest {
  resource?: string;
}

export type ZabbixLinkApi = (request: ZabbixLinkRequest) => angular.IPromise<ZabbixLink[]>;

export interface ZabbixTemplate {
  name: string;
  url: string;
}

export interface ZabbixTemplateRequest {
  name?: string;
  settings_uuid?: string;
}

export type ZabbixTemplateApi = (request: ZabbixTemplateRequest) => angular.IPromise<ZabbixTemplate[]>;
