import { getList, getFirst, post } from '@waldur/core/api';

import { ZabbixLinkApi, ZabbixTemplateApi } from './types';

export const fetchHost = (scope: string) =>
  getFirst('/zabbix-hosts/', {scope});

export const loadLinks: ZabbixLinkApi = request =>
  getList('/zabbix-openstack-links/', request);

export const loadTemplates: ZabbixTemplateApi = request =>
  getList('/zabbix-templates/', request);

export const createHost = request =>
  post('/zabbix-hosts/', {
    service_project_link: request.service_project_link.url,
    name: request.resource.name,
    scope: request.resource.url,
    templates: request.templates.map(template => ({ url: template.url })),
  });
