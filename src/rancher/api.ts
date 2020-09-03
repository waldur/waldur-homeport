import { getById, get, getAll, post, put, deleteById } from '@waldur/core/api';

import {
  RancherProject,
  TemplateVersion,
  Template,
  Cluster,
  Secret,
  Catalog,
  KubeconfigFile,
  HPA,
  HPACreateType,
  ClusterTemplate,
  Workload,
} from './types';

export const getCatalog = (catalogUuid) =>
  getById<Catalog>('/rancher-catalogs/', catalogUuid);

export const createCatalog = (payload) =>
  post<Catalog>('/rancher-catalogs/', payload);

export const deleteCatalog = (catalogUuid) =>
  deleteById('/rancher-catalogs/', catalogUuid);

export const getTemplate = (templateUuid: string) =>
  getById<Template>('/rancher-templates/', templateUuid);

export const getTemplateVersion = (templateUuid: string, versionUuid: string) =>
  get<TemplateVersion>(
    `/rancher-template-versions/${templateUuid}/${versionUuid}/`,
  ).then((response) => response.data);

export const getCluster = (clusterUuid) =>
  getById<Cluster>('/rancher-clusters/', clusterUuid);

export const getKubeconfigFile = (resourceId) =>
  get<KubeconfigFile>(`/rancher-clusters/${resourceId}/kubeconfig_file/`).then(
    (response) => response.data.config,
  );

export const getProjects = (clusterUuid: string) =>
  getAll<RancherProject>('/rancher-projects/', {
    params: { cluster_uuid: clusterUuid },
  });

export const getProjectSecrets = (projectUuid: string) =>
  get<Secret[]>(`/rancher-projects/${projectUuid}/secrets/`).then(
    (response) => response.data,
  );

export const createApp = (payload) => post('/rancher-apps/', payload);

export const removeApp = (uuid) => deleteById(`/rancher-apps/`, uuid);

export const createNode = (payload) => post('/rancher-nodes/', payload);

export const listWorkloads = (params) =>
  getAll<Workload>('/rancher-workloads/', params);

export const redeployWorkload = (id: string) =>
  post(`/rancher-workloads/${id}/redeploy/`);

export const deleteWorkload = (id: string) =>
  deleteById('/rancher-workloads/', id);

export const deleteIngress = (id: string) =>
  deleteById('/rancher-ingresses/', id);

export const listNamespaces = (params) =>
  getAll('/rancher-namespaces/', params);

export const deleteHPA = (hpaUuid) => deleteById('/rancher-hpas/', hpaUuid);

export const createHPA = (payload: HPACreateType) =>
  post<HPA>('/rancher-hpas/', payload);

export const updateHPA = (
  hpaId: string,
  payload: Omit<HPACreateType, 'workload'>,
) => put<HPA>(`/rancher-hpas/${hpaId}/`, payload);

export const listClusterTemplates = (options?) =>
  getAll<ClusterTemplate>('/rancher-cluster-templates/', options);

export const getYAML = (url: string) =>
  get<{ yaml: string }>(`${url}yaml/`).then((response) => response.data);

export const putYAML = (url: string, yaml: string) =>
  put(`${url}yaml/`, { yaml });

export const importYAML = (clusterId: string, yaml: string) =>
  post(`/rancher-clusters/${clusterId}/import_yaml/`, { yaml });

export const deleteService = (id: string) =>
  deleteById('/rancher-services/', id);
