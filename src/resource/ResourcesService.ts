import { get } from '@waldur/core/api';

import { Resource } from './types';

class ResourcesServiceClass {
  private services;

  async get(resource_type, uuid) {
    const url = await this.getUrlByType(resource_type);
    const response = await get<Resource>(url + uuid + '/');
    return response.data;
  }

  async getUrlByType(resource_type) {
    if (resource_type === 'JIRA.Issue') {
      return `/jira-issues/`;
    } else if (resource_type === 'Support.Offering') {
      return `/support-offerings/`;
    } else if (resource_type === 'Rancher.Node') {
      return `/rancher-nodes/`;
    }
    const parts = resource_type.split('.');
    const service_type = parts[0];
    const type = parts[1];
    const services = await this.getServicesList();
    const urlParts = services[service_type].resources[type].split('/');
    return `/${urlParts[urlParts.length - 2]}/`;
  }

  async getServicesList() {
    if (!this.services) {
      const response = await get('/service-metadata/');
      this.services = response.data;
    }
    return this.services;
  }
}

export const ResourcesService = new ResourcesServiceClass();
