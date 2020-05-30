import {
  getById,
  get,
  getAll,
  post,
  remove,
  deleteById,
} from '@waldur/core/api';

import {
  RancherProject,
  TemplateVersion,
  Template,
  Cluster,
  Secret,
  Catalog,
  KubeconfigFile,
} from './types';

export const getCatalog = catalogUuid =>
  getById<Catalog>('/rancher-catalogs/', catalogUuid);

export const createCatalog = payload =>
  post<Catalog>('/rancher-catalogs/', payload);

export const deleteCatalog = catalogUuid =>
  deleteById('/rancher-catalogs/', catalogUuid);

export const getTemplate = (templateUuid: string) =>
  getById<Template>('/rancher-templates/', templateUuid);

export const getTemplateVersion = (templateUuid: string, versionUuid: string) =>
  get<TemplateVersion>(
    `/rancher-template-versions/${templateUuid}/${versionUuid}/`,
  ).then(response => response.data);

export const getCluster = clusterUuid =>
  getById<Cluster>('/rancher-clusters/', clusterUuid);

export const getKubeconfigFile = resourceId =>
  get<KubeconfigFile>(`/rancher-clusters/${resourceId}/kubeconfig_file/`).then(
    response => response.data.config,
  );

export const getProjects = (clusterUuid: string) =>
  getAll<RancherProject>('/rancher-projects/', {
    params: { cluster_uuid: clusterUuid },
  });

export const getProjectSecrets = (projectUuid: string) =>
  get<Secret[]>(`/rancher-projects/${projectUuid}/secrets/`).then(
    response => response.data,
  );

export const createApp = payload => post('/rancher-apps/', payload);

export const removeApp = (projectUuid, appId) =>
  remove(`/rancher-apps/`, {
    data: {
      project_uuid: projectUuid,
      app_id: appId,
    },
  });

export const createNode = payload => post('/rancher-nodes/', payload);
