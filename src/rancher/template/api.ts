import { getById, get, getAll, post } from '@waldur/core/api';

import { RancherProject } from '../types';

import { TemplateVersion, Template, Cluster, Secret } from './types';

export const getTemplate = (templateUuid: string) =>
  getById<Template>('/rancher-templates/', templateUuid);

export const getCluster = clusterUuid =>
  getById<Cluster>('/rancher-clusters/', clusterUuid);

export const getTemplateVersion = (templateUuid: string, versionUuid: string) =>
  get<TemplateVersion>(
    `/rancher-template-versions/${templateUuid}/${versionUuid}/`,
  ).then(response => response.data);

export const getProjects = (clusterUuid: string) =>
  getAll<RancherProject>('/rancher-projects/', {
    params: { cluster_uuid: clusterUuid },
  });

export const createApp = payload => post('/rancher-apps/', payload);

export const getProjectSecrets = (projectUuid: string) =>
  get<Secret[]>(`/rancher-projects/${projectUuid}/secrets/`).then(
    response => response.data,
  );
