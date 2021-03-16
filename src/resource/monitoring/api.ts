import { getById, getList, post, deleteById } from '@waldur/core/api';

import { ZabbixLinkApi, ZabbixTemplateApi } from './types';

export const fetchHost = (uuid: string) => getById('/zabbix-hosts/', uuid);

export const deleteHost = (uuid: string) => deleteById('/zabbix-hosts/', uuid);

export const loadLinks: ZabbixLinkApi = (request) =>
  getList('/zabbix-openstack-links/', request);

export const loadTemplates: ZabbixTemplateApi = (request) =>
  getList('/zabbix-templates/', request);

export const createHost = (request) =>
  post('/zabbix-hosts/', {
    service_settings: request.link.service_settings,
    project: request.link.project,
    name: request.resource.name,
    scope: request.resource.url,
    templates: request.templates.map((template) => ({ url: template.url })),
  });
