import { get, post } from '@waldur/core/api';

export const fetchHost = (scope: string) =>
  get('/zabbix-hosts/', {params: {scope}})
    .then(response => response.data)
    .then(list => list[0]);

export const loadProviders = params =>
  get('/zabbix-service-project-link/', {params});

export const loadTemplates = params =>
  get('/zabbix-templates/', {params});

export const createHost = request =>
  post('/zabbix-hosts/', {
    service_project_link: request.service_project_link.url,
    name: request.resource.name,
    scope: request.resource.url,
    templates: request.templates.map(template => ({ url: template.url })),
  });
